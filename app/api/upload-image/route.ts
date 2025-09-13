import { NextRequest, NextResponse } from 'next/server'

interface ImageUploadResponse {
  success: boolean
  data?: {
    id: string
    title: string
    url_viewer: string
    url: string
    display_url: string
    width: string
    height: string
    size: string
    time: string
    expiration: string
    image: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    thumb: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    medium: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    delete_url: string
  }
  error?: string
}

async function uploadImageToImgbb(
  base64Image: string,
  expiration?: number
): Promise<ImageUploadResponse> {
  try {
    const apiKey = process.env.IMGBB_API_KEY
    
    if (!apiKey) {
      throw new Error('IMGBB_API_KEY environment variable is not set')
    }

    // Remove data URL prefix if present (data:image/png;base64,)
    const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '')
    
    // Create FormData for the POST request
    const formData = new FormData()
    formData.append('image', base64Data)
    
    // Build URL with API key and optional expiration
    const url = new URL('https://api.imgbb.com/1/upload')
    url.searchParams.append('key', apiKey)
    if (expiration) {
      url.searchParams.append('expiration', expiration.toString())
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        error: result.error?.message || 'Upload failed'
      }
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, expiration } = body
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No image data provided' },
        { status: 400 }
      )
    }
    
    const result = await uploadImageToImgbb(image, expiration)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        result,
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('API upload error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}