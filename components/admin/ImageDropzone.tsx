'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface ImageDropzoneProps {
  onImageSelect: (imageUrl: string | null) => void
  currentImage?: string | null
}

export default function ImageDropzone({ onImageSelect, currentImage }: ImageDropzoneProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setPreview(imageUrl)
        onImageSelect(imageUrl)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageSelect])

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
          </div>
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
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
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}