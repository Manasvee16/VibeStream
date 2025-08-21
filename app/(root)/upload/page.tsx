"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import {
  getVideoUploadUrl,
  getThumbnailUploadUrl,
  saveVideoDetails,
  getVideoProcessingStatus,
} from "@/lib/actions/video";
import { useRouter } from "next/navigation";
import { FileInput, FormField } from "@/components";
import { useFileInput } from "@/lib/hooks/useFileInput";
import { MAX_THUMBNAIL_SIZE, MAX_VIDEO_SIZE } from "@/constants";

const uploadFileToBunny = async (
  file: File,
  uploadUrl: string,
  accessKey: string
): Promise<void> => {
  console.log('📤 Starting upload to BunnyCDN...', {
    fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
    fileType: file.type,
    uploadUrl
  });

  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
        AccessKey: accessKey,
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: uploadUrl
      });
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    console.log('✅ Upload successful to BunnyCDN');
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
};

const UploadPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [formData, setFormData] = useState<VideoFormValues>({
    title: "",
    description: "",
    tags: "",
    visibility: "public",
  });
  const video = useFileInput(MAX_VIDEO_SIZE);
  const thumbnail = useFileInput(MAX_THUMBNAIL_SIZE);

  useEffect(() => {
    if (video.duration !== null) {
      setVideoDuration(video.duration);
    }
  }, [video.duration]);

  useEffect(() => {
    const checkForRecordedVideo = async () => {
      try {
        const stored = sessionStorage.getItem("recordedVideo");
        if (!stored) return;

        const { url, name, type, duration } = JSON.parse(stored);
        const blob = await fetch(url).then((res) => res.blob());
        const file = new File([blob], name, { type, lastModified: Date.now() });

        if (video.inputRef.current) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          video.inputRef.current.files = dataTransfer.files;

          const event = new Event("change", { bubbles: true });
          video.inputRef.current.dispatchEvent(event);

          video.handleFileChange({
            target: { files: dataTransfer.files },
          } as ChangeEvent<HTMLInputElement>);
        }

        if (duration) setVideoDuration(duration);

        sessionStorage.removeItem("recordedVideo");
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error loading recorded video:", err);
      }
    };

    checkForRecordedVideo();
  }, [video]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    let uploadedVideoId = '';

    console.log('🚀 Starting video upload process...');

    try {
      // Validation
      console.log('🔍 Validating form data and files...');
      if (!video.file || !thumbnail.file) {
        console.log('❌ Validation failed: Missing files');
        setError("Please upload video and thumbnail files.");
        return;
      }

      if (!formData.title || !formData.description) {
        console.log('❌ Validation failed: Missing required fields');
        setError("Please fill in all required fields.");
        return;
      }

      console.log('✅ Validation successful', {
        videoSize: `${(video.file.size / (1024 * 1024)).toFixed(2)}MB`,
        thumbnailSize: `${(thumbnail.file.size / 1024).toFixed(2)}KB`,
        title: formData.title,
        descriptionLength: formData.description?.length
      });

      // Step 1: Get video upload URL
      console.log('📡 Requesting video upload credentials...');
      const {
        videoId,
        uploadUrl: videoUploadUrl,
        accessKey: videoAccessKey,
      } = await getVideoUploadUrl();

      if (!videoUploadUrl || !videoAccessKey) {
        console.log('❌ Failed to get video credentials');
        setError("Failed to get video upload credentials");
        return;
      }

      uploadedVideoId = videoId;
      console.log('✅ Received video credentials', { videoId });

      // Step 2: Upload video
      console.log('📤 Uploading video file...', {
        name: video.file.name,
        size: `${(video.file.size / (1024 * 1024)).toFixed(2)}MB`,
        type: video.file.type
      });
      
      try {
        await uploadFileToBunny(video.file, videoUploadUrl, videoAccessKey);
        console.log('✅ Video file upload successful');
      } catch (uploadError: unknown) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        console.error('❌ Video upload error:', uploadError);
        setError(`Failed to upload video: ${errorMessage}`);
        return;
      }

      // Step 3: Get thumbnail credentials
      console.log('📡 Requesting thumbnail upload credentials...');
      const {
        uploadUrl: thumbnailUploadUrl,
        cdnUrl: thumbnailCdnUrl,
        accessKey: thumbnailAccessKey,
      } = await getThumbnailUploadUrl(videoId);

      if (!thumbnailUploadUrl || !thumbnailCdnUrl || !thumbnailAccessKey) {
        console.log('❌ Failed to get thumbnail credentials');
        setError("Failed to get thumbnail upload credentials");
        return;
      }
      console.log('✅ Received thumbnail credentials');

      // Step 4: Upload thumbnail
      console.log('📤 Uploading thumbnail...', {
        name: thumbnail.file.name,
        size: `${(thumbnail.file.size / 1024).toFixed(2)}KB`,
        type: thumbnail.file.type
      });
      
      try {
        await uploadFileToBunny(thumbnail.file, thumbnailUploadUrl, thumbnailAccessKey);
        console.log('✅ Thumbnail upload successful');
      } catch (uploadError: unknown) {
        const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown error';
        console.error('❌ Thumbnail upload error:', uploadError);
        setError(`Failed to upload thumbnail: ${errorMessage}`);
        return;
      }

      // Step 5: Save video details
      console.log('💾 Saving video details...', {
        videoId,
        title: formData.title,
        duration: videoDuration
      });

      try {
        await saveVideoDetails({
          videoId,
          thumbnailUrl: thumbnailCdnUrl,
          ...formData,
          duration: videoDuration,
        });
        console.log('✅ Video details saved successfully');
        
        // Step 6: Check video processing
        console.log('⏳ Checking video processing status...');
        const processingCheck = await getVideoProcessingStatus(videoId);
        console.log('📊 Processing status:', processingCheck);
        
        if (!processingCheck.isProcessed) {
          console.log('⏳ Waiting for processing initialization...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        
        console.log('🔄 Redirecting to video page...', { destination: `/video/${videoId}` });
        router.push(`/video/${videoId}`);
        console.log('✅ Upload process complete!');
      } catch (saveError: unknown) {
        const errorMessage = saveError instanceof Error ? saveError.message : 'Unknown error';
        console.error('❌ Save details error:', saveError);
        setError(`Failed to save video details: ${errorMessage}`);
        return;
      }
    } catch (error: unknown) {
      console.error("❌ Upload process error:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Upload failed: ${errorMessage}`);
      
      // Type guard for response property
      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as { response: { status: number; text: () => Promise<string> } };
        console.error('❌ Error response:', {
          status: responseError.response.status,
          data: await responseError.response.text().catch(() => 'No response data')
        });
      }
    } finally {
      console.log('🏁 Upload process finished', { 
        success: !error, 
        videoId: uploadedVideoId 
      });
      setIsSubmitting(false);
    }
  };

  return (
    <main className="wrapper-md upload-page">
      <h1>Upload a video</h1>
      {error && <div className="error-field">{error}</div>}
      <form
        className="rounded-20 gap-6 w-full flex flex-col shadow-10 px-5 py-7.5"
        onSubmit={onSubmit}
      >
        <FormField
          id="title"
          label="Title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter a clear and concise video title"
        />

        <FormField
          id="description"
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Briefly describe what this video is about"
          as="textarea"
        />

        <FileInput
          id="video"
          label="Video"
          accept="video/*"
          file={video.file}
          previewUrl={video.previewUrl}
          inputRef={video.inputRef}
          onChange={video.handleFileChange}
          onReset={video.resetFile}
          type="video"
        />

        <FileInput
          id="thumbnail"
          label="Thumbnail"
          accept="image/*"
          file={thumbnail.file}
          previewUrl={thumbnail.previewUrl}
          inputRef={thumbnail.inputRef}
          onChange={thumbnail.handleFileChange}
          onReset={thumbnail.resetFile}
          type="image"
        />

        <FormField
          id="visibility"
          label="Visibility"
          value={formData.visibility}
          onChange={handleInputChange}
          as="select"
          options={[
            { value: "public", label: "Public" },
            { value: "private", label: "Private" },
          ]}
        />

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </main>
  );
};

export default UploadPage;