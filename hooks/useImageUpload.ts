import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { processImage } from '../utils/imageUtils';
import { ModalType } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

export type UploadSource = 'logo' | 'user' | 'student';

interface UploadConfig {
    source: UploadSource;
    identifier?: string; // Optional ID for filename generation
}

export const useImageUpload = () => {
    const { profile } = useAuth();
    const [isUploading, setIsUploading] = useState(false);

    // Independent Modal State
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: ModalType;
        title: string;
        message: string;
        onConfirm?: () => void;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

    const showModal = (type: ModalType, title: string, message: string, onConfirm?: () => void) => {
        setModal({ isOpen: true, type, title, message, onConfirm });
    };

    const uploadImage = async (
        file: File,
        config: UploadConfig
    ): Promise<string | null> => {

        // 0. Permission Check
        if (profile?.tipo !== 'Administrador') {
            showModal('error', 'Acesso Negado', 'Somente administradores podem fazer upload de imagens.');
            return null;
        }

        // 1. Validate Type
        const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showModal('error', 'Formato Inválido', 'Apenas imagens JPG, PNG ou SVG são permitidas.');
            return null;
        }

        // 2. Validate Strict Input Limit (200KB)
        const MAX_SIZE = 200 * 1024; // 200KB

        if (file.size > MAX_SIZE) {
            showModal('error', 'Arquivo Muito Grande', 'A imagem original deve ter menos de 200KB.');
            return null;
        }

        setIsUploading(true);

        try {
            let fileToUpload: File | Blob = file;
            let fileExt = file.name.split('.').pop()?.toLowerCase();
            let contentType = file.type;

            // 3. Compression / Processing
            if (file.type !== 'image/svg+xml') {
                try {
                    // Define strategies based on Source
                    let compressedBlob: Blob;

                    if (config.source === 'logo') {
                        // Logo: PNG (Transparency), 500x500
                        compressedBlob = await processImage(file, 500, 500, 0.9, 'image/png');
                        fileExt = 'png';
                        contentType = 'image/png';
                    } else {
                        // User/Student: JPEG (Small), 300x300
                        compressedBlob = await processImage(file, 300, 300, 0.7, 'image/jpeg');
                        fileExt = 'jpg';
                        contentType = 'image/jpeg';
                    }

                    // 4. Validate Compressed Size
                    // Improvement: If compressed is > MAX_SIZE but ORIGINAL was < MAX_SIZE, and original is valid type, prefer original.
                    // This prevents "optimizing" a small file into a larger one and then rejecting it.
                    if (compressedBlob.size > MAX_SIZE) {
                        if (file.size <= MAX_SIZE && config.source === 'logo' && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                            // Fallback to original
                            fileToUpload = file;
                            // We must ensure content type matches original
                            contentType = file.type;
                            fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
                        } else {
                            showModal('error', 'Arquivo Muito Grande', 'A imagem é muito grande mesmo após compressão.');
                            setIsUploading(false);
                            return null;
                        }
                    } else {
                        fileToUpload = compressedBlob;
                    }

                } catch (err) {
                    console.error("Compression error:", err);
                    showModal('error', 'Erro de Processamento', 'Não foi possível processar a imagem.');
                    setIsUploading(false);
                    return null;
                }
            }

            // 5. Generate Filename
            let fileName = '';
            let folder = '';
            const timestamp = Date.now();

            if (config.source === 'logo') {
                fileName = `school-logo-${timestamp}.${fileExt}`;
                folder = '';
            } else if (config.source === 'user') {
                folder = 'profissionais/';
                fileName = `${folder}${config.identifier || 'user'}-${timestamp}.${fileExt}`;
            } else if (config.source === 'student') {
                folder = 'students/';
                fileName = `${folder}${config.identifier || 'student'}-${timestamp}.${fileExt}`;
            }

            // 6. Upload to Supabase 
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, fileToUpload, {
                    contentType: contentType,
                    upsert: true
                });

            if (error) {
                if (error.message.includes('size')) {
                    throw new Error('O banco de dados rejeitou o arquivo por tamanho excessivo.');
                }
                throw error;
            }

            // 7. Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;

            // Success Feedback (Logo Only)
            if (config.source === 'logo') {
                showModal('success', 'Upload Concluído', 'O logotipo foi atualizado com sucesso.');
            }

            return publicUrl;

        } catch (error: any) {
            console.error('Upload hook error:', error);
            showModal('error', 'Erro no Upload', 'Falha ao enviar imagem: ' + (error.message || 'Erro desconhecido'));
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        uploadImage,
        isUploading,
        modal,
        closeModal
    };
};
