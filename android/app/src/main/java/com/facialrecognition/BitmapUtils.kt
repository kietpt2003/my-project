package com.facialrecognition

import android.graphics.*
import android.media.Image
import android.util.Base64
import android.util.Log
import com.mrousavy.camera.core.FrameInvalidError
import com.mrousavy.camera.frameprocessors.Frame
import com.mrousavy.camera.core.types.Orientation
import java.io.*
import java.nio.ByteBuffer

object BitmapUtils {
    private const val TAG = "BitmapUtils"

    /** Converts NV21 format byte buffer to bitmap. */
    fun getBitmap(data: ByteBuffer, metadata: FrameMetadata): Bitmap? {
        return try {
            data.rewind()
            val imageInBuffer = ByteArray(data.limit()).apply { data.get(this) }
            val image = YuvImage(imageInBuffer, ImageFormat.NV21, metadata.width, metadata.height, null)
            ByteArrayOutputStream().use { stream ->
                image.compressToJpeg(Rect(0, 0, metadata.width, metadata.height), 80, stream)
                val bmp = BitmapFactory.decodeByteArray(stream.toByteArray(), 0, stream.size())
                rotateBitmap(bmp, metadata.rotation, false, false)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error: ${e.message}")
            null
        }
    }

    /** Converts a YUV_420_888 image from Vision Camera API to a bitmap. */
    @Throws(FrameInvalidError::class)
    fun getBitmap(image: Frame): Bitmap? {
        val frameMetadata = FrameMetadata.Builder()
                .setWidth(image.width)
                .setHeight(image.height)
                .setRotation(getRotationDegreeFromOrientation(image.orientation))
                .build()

        val nv21Buffer = yuv420ThreePlanesToNV21(image.image.planes, image.width, image.height)
        return getBitmap(nv21Buffer, frameMetadata)
    }

    private fun getRotationDegreeFromOrientation(orientation: Orientation): Int {
        return when (orientation.unionValue) {
            Orientation.PORTRAIT.unionValue -> 90
            Orientation.LANDSCAPE_LEFT.unionValue -> 0
            Orientation.LANDSCAPE_RIGHT.unionValue -> 270
            Orientation.PORTRAIT_UPSIDE_DOWN.unionValue -> 180
            else -> 0
        }
    }

    /** Rotates a bitmap if it is converted from a bytebuffer. */
    private fun rotateBitmap(bitmap: Bitmap, rotationDegrees: Int, flipX: Boolean, flipY: Boolean): Bitmap {
        val matrix = Matrix().apply {
            postRotate(rotationDegrees.toFloat())
            postScale(if (flipX) -1f else 1f, if (flipY) -1f else 1f)
        }
        return Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true).also {
            if (it != bitmap) bitmap.recycle()
        }
    }

    /** Converts YUV_420_888 to NV21 bytebuffer. */
    private fun yuv420ThreePlanesToNV21(planes: Array<Image.Plane>, width: Int, height: Int): ByteBuffer {
        val imageSize = width * height
        val out = ByteArray(imageSize + 2 * (imageSize / 4))

        if (areUVPlanesNV21(planes, width, height)) {
            planes[0].buffer.get(out, 0, imageSize)
            planes[2].buffer.get(out, imageSize, 1)
            planes[1].buffer.get(out, imageSize + 1, 2 * imageSize / 4 - 1)
        } else {
            unpackPlane(planes[0], width, height, out, 0, 1)
            unpackPlane(planes[1], width, height, out, imageSize + 1, 2)
            unpackPlane(planes[2], width, height, out, imageSize, 2)
        }
        return ByteBuffer.wrap(out)
    }

    /** Checks if the UV plane buffers of a YUV_420_888 image are in the NV21 format. */
    private fun areUVPlanesNV21(planes: Array<Image.Plane>, width: Int, height: Int): Boolean {
        val imageSize = width * height
        val uBuffer = planes[1].buffer
        val vBuffer = planes[2].buffer

        val vBufferPosition = vBuffer.position()
        val uBufferLimit = uBuffer.limit()

        vBuffer.position(vBufferPosition + 1)
        uBuffer.limit(uBufferLimit - 1)

        val areNV21 = vBuffer.remaining() == (2 * imageSize / 4 - 2) && vBuffer.compareTo(uBuffer) == 0

        vBuffer.position(vBufferPosition)
        uBuffer.limit(uBufferLimit)

        return areNV21
    }

    /** Unpack an image plane into a byte array. */
    private fun unpackPlane(plane: Image.Plane, width: Int, height: Int, out: ByteArray, offset: Int, pixelStride: Int) {
        val buffer = plane.buffer.apply { rewind() }
        val numRow = (buffer.limit() + plane.rowStride - 1) / plane.rowStride
        if (numRow == 0) return

        val scaleFactor = height / numRow
        val numCol = width / scaleFactor

        var outputPos = offset
        var rowStart = 0
        repeat(numRow) {
            var inputPos = rowStart
            repeat(numCol) {
                out[outputPos] = buffer[inputPos]
                outputPos += pixelStride
                inputPos += plane.pixelStride
            }
            rowStart += plane.rowStride
        }
    }

    fun base642Bitmap(base64: String): Bitmap? {
        return try {
            val decode = Base64.decode(base64, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(decode, 0, decode.size)
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "Invalid Base64 string", e)
            null
        }
    }

    fun bitmap2Base64(bitmap: Bitmap): String {
        return ByteArrayOutputStream().use { outputStream ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
            Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
        }
    }

    fun saveImage(bitmap: Bitmap, dir: File, fileName: String): String {
        val file = File(dir, fileName)
        return try {
            FileOutputStream(file).use { fos ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100, fos)
                fos.flush()
            }
            file.absolutePath
        } catch (e: IOException) {
            Log.e(TAG, "Error saving image", e)
            ""
        }
    }
}