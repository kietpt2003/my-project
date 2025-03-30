package com.facialrecognition

import android.graphics.BitmapFactory
import android.util.Base64
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetectorOptions

class FacialRecognitionModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        // Initialize any resources needed for facial recognition
    }

    override fun getName(): String {
        return "FacialRecognition"
    }

    @ReactMethod
    fun initializeRecognition(promise: Promise) {
        // Initialize the facial recognition process
        // Return success or failure through the promise
        promise.resolve("Facial recognition initialized")
    }

    @ReactMethod
    fun detectFaces(base64Image: String, promise: Promise) {
        try {
            val decodedBytes = Base64.decode(base64Image, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
            val image = InputImage.fromBitmap(bitmap, 0)

            val options = FaceDetectorOptions.Builder()
                    .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
                    .build()

            val detector = FaceDetection.getClient(options)
            detector.process(image)
                    .addOnSuccessListener { faces ->
                        val result = Arguments.createArray()
                        for (face in faces) {
                            val map = Arguments.createMap()
                            map.putDouble("x", face.boundingBox.left.toDouble())
                            map.putDouble("y", face.boundingBox.top.toDouble())
                            map.putDouble("width", face.boundingBox.width().toDouble())
                            map.putDouble("height", face.boundingBox.height().toDouble())
                            result.pushMap(map)
                        }
                        promise.resolve(result)
                    }
                    .addOnFailureListener { e ->
                        promise.reject("FACE_DETECTION_FAILED", e)
                    }
        } catch (e: Exception) {
            promise.reject("IMAGE_PROCESSING_FAILED", e)
        }
    }
}