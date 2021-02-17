<template>
    <v-container align="center" >
		<v-row v-if="editingImage" :justify="'center'">
			<!--<vue-cropper
				ref="cropper"
				:src="getImageToCtop()"
				alt="Source Image"
				@cropend="finishImageCropping()"
				>
				</vue-cropper> !-->
		<v-col cols="12">
			<v-row :justify="'center'">
				<v-col cols="6">
					<VueCropper ref="cropper" :src="getImageToCtop()" 
					@cropmove="updateCropInformation()" 
					@ready="updateCropInformation()" alt="Source Image"></VueCropper>
				</v-col>
				<v-col cols="6">
					<span>Ideal aspect ratio: <strong>[1.7, 2.5]</strong> </span>
					<br/>
					<span>Crop aspect ratio: <strong>{{ cropData.cropAspectRatio.toFixed(2) }}</strong></span>
					<br/>
					<br/>
					<span>Original Width: <strong>{{ cropData.originalWidth }}</strong></span>
					<br/>
					<span>Original Height: <strong>{{ cropData.originalHeight }}</strong></span>
					<br/>
					<br/>
					<span>Cropped Width: <strong>{{ Math.floor(cropData.cropWidth) }}</strong></span>
					<br/>
					<span>Cropped Height: <strong>{{ Math.floor(cropData.cropHeight) }}</strong></span>
				</v-col>
			</v-row>
			<v-row>
				<v-col>
					<v-btn class="ma-2" outlined color="indigo" @click="finishImageCropping()">Crop</v-btn>
					<v-btn class="ma-2" depressed @click="cancelImageCropping()">Cancel</v-btn>
				</v-col>
			</v-row>
		</v-col>
					
		</v-row>
        <v-row v-if="!editingImage">
			<v-col>
				<v-row no-gutters>

					<v-col no-gutters cols="6" >
						<v-row no-gutters >
							<v-file-input class="mt-1" max-height="200px" prepend-icon="mdi-camera" show-size label="Recipe Photo" @change="preview_image" />
						</v-row>

						<v-row no-gutters>
							<span class="ml-5">OR</span>
						</v-row>

						<v-row no-gutters >
							<v-text-field class="pa-0 ma-0" label="URL" v-model="newUrl" @inp="download_image"></v-text-field>
						</v-row>
					</v-col>


					<v-col no-gutters cols="6">
						<v-img contain height="150px" :src="newUrl"></v-img>
					</v-col>
				</v-row>
				<v-row v-if="newUrl">
					<v-spacer></v-spacer>
					<v-col no-gutters cols="6" align="center">
						<v-btn :disabled="newFile == null" d-flex @click="addMainImage">Main Image</v-btn>
						&nbsp;
						<v-btn :disabled="newFile == null" @click="addAlternativeImage">Alternative Image</v-btn>
					</v-col>
				
				</v-row>
			
				<v-divider/>
				<v-row>
					<v-col align="center">
						<v-btn width="200px" color="#4CAF50" @click="finish">Finish</v-btn>
					</v-col>
					<v-col cols="12" align="center">
						<b-alert variant="danger" v-if="err" show>{{this.err}}</b-alert>
					</v-col>
					<v-col cols="12" align="center">
						<h5>Main Image</h5>
					</v-col>
					<v-col v-if="mainUrl" no-gutters align="center">
						<div class="img-wrap">
							<v-icon dense @click="deleteMainImage()" class="close">mdi-close</v-icon>
							<v-icon small @click="openPhotoEditor(mainUrl, true, -1)" class="edit">mdi-wrench</v-icon>
							<v-icon dense @click="swapImages(mainUrl, true, -1)" class="swap">mdi-swap-horizontal</v-icon>
							<img height="150px" contain :src="mainUrl"/>
						</div>

					</v-col>

				</v-row>
				<v-row>
					<v-col cols="12" align="center">
						<h5>Alternative Images</h5>
					</v-col>

					<v-col v-show="alternativeImages.length > 0" no-gutters align="center">
						<v-row style="overflow-y: scroll; max-height: 300px">
							<v-col cols="auto" v-for="(imageObj, index) in alternativeImages" :key="index">
								<div class="img-wrap">
									<v-icon dense @click="deleteAlternativeImage(index)" class="close">mdi-close</v-icon>
									<v-icon small @click="openPhotoEditor(imageObj.url, false, index)" class="edit">mdi-wrench</v-icon>
									<v-icon dense @click="swapImages(imageObj.url, false, index)" class="swap">mdi-swap-horizontal</v-icon>
									<img height="150px" contain :src="imageObj.url"/>
								</div>
							</v-col>
						</v-row>
					</v-col>
					
				</v-row>
			</v-col>
        </v-row>
    </v-container>
</template>

<script>

var utils = require('../../utils');
import VueCropper from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';

export default {
	name: "AddIngredientCore",
	components: {
		VueCropper
	},
	props : {
		initialMainUrl: Object,
		initialAlternativeImages: Array,
	},
    data(){
        return {
			deploy_to : process.env.VUE_APP_DATABASE,
			err: "",
			newUrl: "",
			newFile: null,
			mainUrl: "",
			mnainFile: null,
			alternativeImages : this.initialAlternativeImages, //List of {url, file}
			editingImage: false,

			//Editor
			cropData: {
				imageToCrop: "",
				isCropingMainImage: false,
				imageIndex: -1,
				cropAspectRatio: 0,
				cropWidth: 0,
				cropHeight: 0,
				originalWidth: 0,
				originalHeight: 0
			}
			
        }
	},
	created : function () {
		console.log(this.mainUrl)
		if(this.initialMainUrl){
			this.mainUrl = this.initialMainUrl.url
		}
		
		if(this.initialAlternativeImages.length){
			this.alternativeImages = this.initialAlternativeImages
		}
	},

    methods: {
		showErr(msg){
          this.err = msg
          setTimeout(() => this.err = null, 2500);
        },
		preview_image(file){
            if(file){
                utils.processImageFile(file,this,true);
            } else {
                this.newUrl = null;
                this.newFile = null;
            }
		},
		download_image(){
            if(this.newUrl != ""){

                utils.downloadImageFile(this.newUrl, this);
            }
        },
		setLocalUrl(url){
            this.newUrl = url;
        }
        ,
        setLocalFile(file){
            this.newFile = file;
		},
		addMainImage(){
			if(this.newUrl){
				this.mainUrl = this.newUrl,
				this.mainFile = this.newFile

				this.newUrl = ""
				this.newFile = null
			}
		}, 
		addAlternativeImage(){
			if(this.newUrl && this.newFile){
				this.alternativeImages.push({url: this.newUrl, file: this.newFile})
				this.newUrl = ""
				this.newFile = null
			}
		},
		deleteMainImage(){
			this.mainUrl = ""
			this.mainFile = null
		},
		deleteAlternativeImage(index){
			this.alternativeImages.splice(index, 1)
		},
		openPhotoEditor(url, isMainImage, imageIndex){
			this.editingImage = true;
			this.cropData.imageToCrop = url
			this.cropData.isCropingMainImage = isMainImage
			this.cropData.imageIndex = imageIndex
		},
		swapImages(url, isMainImage, imageIndex){
			if(isMainImage){
				this.alternativeImages.push({url: this.mainUrl, file: this.mainUrl})
				this.deleteMainImage()
			} else {
				this.mainUrl = this.alternativeImages[imageIndex].url
				this.mainFile = this.alternativeImages[imageIndex].file
				this.deleteAlternativeImage(imageIndex)
			}
		},
		getImageToCtop(){
			//USE PROXY TO AVOID CORS
			let proxy = "https://api.allorigins.win/raw?url="
			if(this.cropData.imageToCrop.includes("blob") || this.cropData.imageToCrop.includes("data"))
				return this.cropData.imageToCrop
			else 
				return proxy + this.cropData.imageToCrop
		},
		cancelImageCropping(){
			this.editingImage = false;
		},
		updateCropInformation(){
			let cropbox = this.$refs["cropper"].getCropBoxData()
			this.cropData.originalWidth = this.$refs["cropper"].getCanvasData()["naturalWidth"]
			this.cropData.originalHeight = this.$refs["cropper"].getCanvasData()["naturalHeight"]

			let canvasWidth = this.$refs["cropper"].getCanvasData()["width"]
			let canvasHeight = this.$refs["cropper"].getCanvasData()["height"]
			let widthRatio = this.cropData.originalWidth/canvasWidth
			let heightRatio = this.cropData.originalHeight/canvasHeight

			this.cropData.cropWidth = cropbox.width * widthRatio
			this.cropData.cropHeight = cropbox.height * heightRatio
			this.cropData.cropAspectRatio = cropbox.width / cropbox.height
		},
		async finishImageCropping(){
			let canvas = this.$refs["cropper"].getCroppedCanvas()
			let blob = await fetch(canvas.toDataURL('image/jpeg', 0.75)).then(res => res.blob())
			let croppedUrl = window.URL.createObjectURL(blob)
			let croppedFile = new File([blob], "cropped-img.jpg", {type: "image/jpeg"})
			
			if(this.cropData.isCropingMainImage){
				this.mainUrl = croppedUrl
				this.mainFile = croppedFile
			} else {
				this.alternativeImages[this.cropData.imageIndex].url = croppedUrl
				this.alternativeImages[this.cropData.imageIndex].file = croppedFile
			}
			this.editingImage = false;	

		},
		finish(){
			if(this.mainUrl){
				let allImages = []
				allImages.push({url: this.mainUrl, file: this.mainFile})
				allImages = allImages.concat(this.alternativeImages)
				this.$emit('close', {allImages: allImages})
			} else {
				this.showErr("Please choose one main image");
			}
		}
    },

}
</script>

<style scoped>

.img-wrap {
	display: inline-block;
    position: relative;
	height: 150px;
}
.img-wrap .close {
	color: red;
    position: absolute;
    top: -5px;
    right: -20px;
    z-index: 100;
}

.img-wrap .edit {
	color: red;
    position: absolute;
    top: 20px;
    right: -18px;
    z-index: 100;
}

.img-wrap .swap {
	color: red;
    position: absolute;
    top: 40px;
    right: -20px;
    z-index: 100;
}

.cropped-image img {
  max-width: 70%;
  max-height: 70%;
  height: 300px;
}
</style>