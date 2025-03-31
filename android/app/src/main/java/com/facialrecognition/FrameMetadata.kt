package com.facialrecognition

data class FrameMetadata(val width: Int, val height: Int, val rotation: Int) {

    /** Builder của [FrameMetadata] */
    class Builder {
        private var width: Int = 0
        private var height: Int = 0
        private var rotation: Int = 0

        fun setWidth(width: Int) = apply { this.width = width }
        fun setHeight(height: Int) = apply { this.height = height }
        fun setRotation(rotation: Int) = apply { this.rotation = rotation }

        fun build() = FrameMetadata(width, height, rotation)
    }
}