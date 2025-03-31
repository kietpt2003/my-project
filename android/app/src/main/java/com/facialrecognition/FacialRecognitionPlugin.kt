package com.facialrecognition

import android.graphics.Bitmap
import android.util.Log
import com.facialrecognition.BitmapUtils.getBitmap
import com.google.android.gms.tasks.Tasks
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.mrousavy.camera.core.FrameInvalidError
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin
import com.mrousavy.camera.frameprocessors.VisionCameraProxy
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext


class FacialRecognitionPlugin(
    proxy: VisionCameraProxy,
    options: Map<String, Any>? = null
) : FrameProcessorPlugin() {

    override fun callback(frame: Frame, arguments: Map<String, Any>?): Any {
//        return HashMap<String, Any>()
//        val result = mutableMapOf<String, Any>()
//
//        try {
//            Log.d("FacialRecognition", "vo day")
//            // Chuyển đổi frame thành Bitmap
//            val bm: Bitmap = getBitmap(frame) ?: return result
//
//            // Cấu hình FaceDetector
//            val options = FaceDetectorOptions.Builder()
//                    .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
//                    .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
//                    .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
//                    .build()
//
//            val image = InputImage.fromBitmap(bm, 0)
//
//            val detector = FaceDetection.getClient(options)
//
//            detector.process(image)
//                    .addOnSuccessListener { faces ->
//                        val faceData = faces.map { face ->
//                            Log.d("FacialRecognition", "my face ${face.toString()}")
//                            mapOf(
//                                    "bounds" to face.boundingBox.toShortString(),
//                                    "leftEyeOpenProbability" to (face.leftEyeOpenProbability ?: -1),
//                                    "rightEyeOpenProbability" to (face.rightEyeOpenProbability ?: -1),
//                                    "smilingProbability" to (face.smilingProbability ?: -1)
//                            )
//                        }
//                        result["faces"] = faceData
//                        Log.d("FacialRecognition", "end nha ${result.size}")
//                    }
//                    .addOnFailureListener { e ->
//                        Log.e("FacialRecognition", "Face detection failed", e)
//                    }
//        } catch (e: FrameInvalidError) {
//            Log.e("FacialRecognition", "Face detection err", e)
//            throw RuntimeException(e)
//        }
//
//        return result

        return runBlocking {
            withContext(Dispatchers.IO) { // Chạy trên luồng nền để tránh block UI
                val result = mutableMapOf<String, Any>()

                try {
                    Log.d("FacialRecognition", "Vào callback")

                    // Chuyển đổi frame thành Bitmap
                    val bm: Bitmap = getBitmap(frame) ?: return@withContext result

                    // Cấu hình FaceDetector
                    val options = FaceDetectorOptions.Builder()
                            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
                            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
                            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
                            .build()

                    val image = InputImage.fromBitmap(bm, 0)
                    val detector = FaceDetection.getClient(options)

                    // 🛑 Đợi xử lý xong trước khi tiếp tục
                    val faces = Tasks.await(detector.process(image))

                    val faceData = faces.map { face ->
                        Log.d("FacialRecognition", "Nhận diện được mặt: ${face.boundingBox}")
                        mapOf(
                                "bounds" to mapOf(
                                        "left" to face.boundingBox.left,
                                        "top" to face.boundingBox.top,
                                        "right" to face.boundingBox.right,
                                        "bottom" to face.boundingBox.bottom
                                ),
                                "leftEyeOpenProbability" to (face.leftEyeOpenProbability?.toDouble() ?: -1.0),
                                "rightEyeOpenProbability" to (face.rightEyeOpenProbability?.toDouble() ?: -1.0),
                                "smilingProbability" to (face.smilingProbability?.toDouble() ?: -1.0)
                        )
                    }
                    result["faces"] = faceData
                    Log.d("FacialRecognition", "Kết thúc, result size: ${result.size}")
                } catch (e: Exception) {
                    Log.e("FacialRecognition", "Lỗi nhận diện khuôn mặt", e)
                    result["error"] = e.localizedMessage ?: "Face detection failed"
                }
                result
            }
        }
    }
}