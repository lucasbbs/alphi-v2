'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageDropzoneProps {
  onImageSelect: (imageUrl: string | null) => void
  currentImage?: string | null
  onImageUpload?: (uploadedUrl: string) => void
  autoUpload?: boolean
}

export default function ImageDropzone({ onImageSelect, currentImage, onImageUpload, autoUpload = false }: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [isUploading, setIsUploading] = useState(false)

  const uploadToImgbb = async (base64Image: string) => {
    try {
      setIsUploading(true)
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: base64Image,
          expiration: 600 // 10 minutes expiration
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Image uploadée avec succès!')
        return result.data.url
      } else {
        toast.error(`Erreur d'upload: ${result.error}`)
        return null
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Erreur lors de l\'upload de l\'image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string
        setPreview(imageUrl)
        onImageSelect(imageUrl)
        
        // Auto-upload to imgbb if enabled
        if (autoUpload && onImageUpload) {
          const uploadedUrl = await uploadToImgbb(imageUrl)
          if (uploadedUrl) {
            onImageUpload(uploadedUrl)
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }, [onImageSelect, onImageUpload, autoUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const removeImage = () => {
    setPreview(null)
    onImageSelect(null)
  }

  const uploadManually = async () => {
    if (preview && onImageUpload) {
      const uploadedUrl = await uploadToImgbb(preview)
      if (uploadedUrl) {
        onImageUpload(uploadedUrl)
      }
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Image du poème
      </label>
      
      {preview ? (
        <div className="relative">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Aperçu de l'image"
              fill
              className="object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            {!autoUpload && onImageUpload && (
              <button
                onClick={uploadManually}
                disabled={isUploading}
                className="bg-green-500 text-white p-1 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50"
                title="Upload vers imgbb"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={removeImage}
              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-orange-400 bg-orange-50' 
              : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-gray-400">
              {isDragActive ? (
                <Upload className="w-full h-full" />
              ) : (
                <ImageIcon className="w-full h-full" />
              )}
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive 
                  ? 'Déposez l\'image ici...' 
                  : 'Glissez et déposez une image ici'
                }
              </p>
              <p className="text-sm text-gray-500">
                ou cliquez pour sélectionner un fichier
              </p>
              <p className="text-xs text-gray-400 mt-2">
                PNG, JPG, WEBP jusqu'à 10MB
                {autoUpload && ' - Upload automatique vers imgbb'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}