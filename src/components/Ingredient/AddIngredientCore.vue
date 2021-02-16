<template>
    <v-container fill-height>
        <v-row justify="center" align="center">
            <b-alert variant="success" v-if="this.success" show>{{this.success}}</b-alert>
            <b-alert variant="danger" v-if="this.err" show>{{this.err}}</b-alert>
            <v-col justify="space-around" align="center" cols="12">
              
            <form ref='ingredientForm' v-on:submit.prevent="submit">
            <v-row no-gutters >
              <v-text-field label="Ingredient Name" v-model="currentIngredient.name"></v-text-field>
            </v-row>
            <v-row no-gutters justify="center" align="center">
                    <v-select label="Category" v-model="currentIngredient.category"
                        :items="categories"
                        item-text="name"
                        return-object>
                    </v-select>
            </v-row>
            <v-row no-gutters justify="center" align="center">
                <v-col cols="12">
                    <b-form-group label="Exclude from Diets">
                        <b-form-checkbox-group
                            v-model="currentIngredient.diets"
                            :options="diets"
                            value-field="id"
                            inline
                            text-field="name"
                            >
                        </b-form-checkbox-group>
                    </b-form-group>
                </v-col>
                
            </v-row>
            <v-row v-if="currentIngredient.img" align="center" justify="center">
                <v-col cols="12">
                    <v-img ref="currentImg" contain height="200px" :src="currentIngredient.img" @load="updateImageDimensions()"></v-img>
                </v-col>
                <v-col cols="12">
                    <span>Ratio: <strong> {{ (currentImgWidth / currentImgHeight).toFixed(2) }}</strong></span>
                    &nbsp;
                    <span>Width: <strong>{{ currentImgWidth }}</strong></span>
                    &nbsp;
                    <span>Height: <strong>{{ currentImgHeight }}</strong></span>
                    <br/>
                </v-col>
            </v-row>
            <v-row no-gutters align="center" justify="center">
                <v-col cols="12">
                    <v-btn @click="openImageSelectionComponent">OPEN IMAGE SELECTION</v-btn>
                </v-col>
            </v-row>
            
            <v-row class="mt-5" no-gutters align="center" justify="center">
                <v-col cols="12">
                    <button type="submit" class="btn btn-primary" >Submit</button>
                </v-col>
            </v-row>

            </form>
            
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'
import Vue from 'vue'
import { getSignedUrl, uploadImageFileToS3} from '@/helpers/s3-image-storage'
import { mapExternalIngredients } from '@/helpers/searchModelsBySimilarity'
import ImageSelection from '../UtilityComponents/ImageSelection.vue'

var utils = require('../../utils');

export default {
    name: "AddIngredientCore",
    components: {
        ImageSelection
    },
    props : {
        initialName: {
            type: String,
            default: ''
        },
        initialUrl: {
            type: String,
            default: ''
        },
        initialCategory : {
            type: Object,
            default: undefined
        },
        initialDiets : {
            type: Array,
            default:() => []
        },
        initialEditIngredientId : {
            type: Number,
            default: undefined
        }, parentRequestId : {
            type: Number,
            default: undefined
        }
    },
    data(){
        return {
            deploy_to : process.env.VUE_APP_DATABASE,
            uploadedFile: null,
            uploadedUrl: null,
            err: null,
            success: null,
            currentIngredient: {
                "name" : this.initialName,
                "img" : this.initialUrl,
                "category" : this.initialCategory,
                "diets": this.convertDietObjArrayToIds(this.initialDiets),
                "is_valid": true
            },
            categories : [],
            diets : [],
            ourIngredients : [],
            editIngredientId : this.initialEditIngredientId,
            currentImgWidth: 0,
            currentImgHeight: 0
        }
    },

    methods: {
         showErr(msg, timeout=3000){
          this.err = msg
          setTimeout(() => this.err = null, timeout);
        },
        showSuccess(msg){
            this.success = msg
            setTimeout(() => this.success = null, 3000);
        },
        clearForms(){
            //File input form must be manually cleared to avoid bugs 
            this.currentIngredient = {
                "name" : '',
                "img" : '',
                "category" : undefined,
                "diets": undefined
            },
            this.uploadedUrl = null
            this.uploadedFile = null
        },
        ingredientNameNormalization(name){
            return name.toLowerCase().replace(/ /g, '-')
        },

        checkIfIngredientExists(name){
            for(var i = 0; i < this.ourIngredients.length; i++){
                if(name.toLowerCase().trim() === this.ourIngredients[i].name.toLowerCase().trim()){
                    return true
                }
            }
            return false;
        },
        validateIngredient(){
            if(this.currentIngredient.name.length < 2){
                this.showErr("Name is too short");
                return false
            }
            if(!this.isInEditMode() && this.checkIfIngredientExists(this.currentIngredient.name)){
                this.showErr("Ingredient with this name already exists");
                return false
            }
            if(!this.uploadedFile && !this.currentIngredient.img){
                this.showErr("You must upload an image");
                return false
            }
            if(this.currentIngredient.category == undefined){
                this.showErr("Please select a category");
                return false
            }
            return true
        },
        isInEditMode(){
            return this.editIngredientId !== undefined;
        },
        convertDietObjArrayToIds(dietObjects){
            return dietObjects.map(x => x.id)
        },
        convertDietIdsToObjectArray(dietIds){
            return this.diets.filter(d => dietIds.includes(d.id))
        },
        async checkSimilarIngredients(ingredientName){
            const ingredientMapping = await mapExternalIngredients([ingredientName], this.deploy_to, `Token ${this.$store.getters.getToken}`)
            const suspectIngredients = ingredientMapping[ingredientName]
            let similarIngredients = []


            if(suspectIngredients)
                similarIngredients = suspectIngredients.filter(r => r.similarity >= 0.35).map(r => r.name)
            
            return similarIngredients;
        },

        async submit(){
            
            if(this.validateIngredient()) {
                console.log("Ingredient {0} Is Valid", this.currentIngredient.name)

                
                if(this.isInEditMode()){
                    //Need to map diet id to diet object
                    this.currentIngredient.diets = this.diets.filter(d => this.currentIngredient.diets.includes(d.id))
                    this.submitEditedIngredient();
                } else {
                    //Inserting new ingredient, need to check for similar ingredients
                    let similarIngredients = await this.checkSimilarIngredients(this.currentIngredient.name)
                    if(similarIngredients.length > 0){
                        //Require Confirmation
                        if(confirm('There are similar ingredients to: ' + this.currentIngredient.name + ', like: ' + similarIngredients.join(', ')))
                            this.submitNewIngredient();
                    } else {
                        this.submitNewIngredient();
                    }
                }
            
            }
        },
        async submitNewIngredient(){
            
            let imageUrl = await this.generateImageUrl(this.currentIngredient.img, this.uploadedFile)

            const ingredient = {
                name: this.currentIngredient.name,
                img: imageUrl,
                category: this.currentIngredient.category.id,
                diets: this.currentIngredient.diets
            }

            console.log(ingredient)
            axios.post(this.deploy_to + 'ingredient/', ingredient, {headers: {'Authorization': `Token ${this.$store.getters.getToken}`}})
            .then((response) => {
                this.currentIngredient.id = response.data.id
                this.showSuccess("Ingredient Created With ID: " + this.currentIngredient.id)
                this.$emit('close', {paramList: [this.currentIngredient, this.parentRequestId]})
                this.clearForms()
            })
            .catch(errors => {
                console.log(errors)
                this.showErr(errors)
            })
        },
        async submitEditedIngredient(){
            console.log("submiting edited ingredient: " + this.currentIngredient.name)

            this.currentIngredient.id = this.editIngredientId
            this.currentIngredient.img = await this.generateImageUrl(this.currentIngredient.img, this.uploadedFile)


            axios.post(this.deploy_to + 'backoffice/edit/ingredient/'+this.currentIngredient.id+"/", this.currentIngredient, {headers: {'Authorization': `Token ${this.$store.getters.getToken}`}})
            .then((response) => {
                this.showSuccess("Success")
                this.$emit('close', {paramList: [this.currentIngredient, this.parentRequestId]})
                console.log(response);
            })
            .catch(errors => {
                this.showErr(errors)
                console.log(errors.status)
            })
        },
        generateImageName(file){
            const fileExtension = "." + file.name.split('.').pop();
            const randomInt = "_" + Math.floor(Math.random() * 10000)
            let name = this.currentIngredient.category.id + "_" + this.currentIngredient.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + randomInt + fileExtension
            console.log("Generated image name from file {0}, name: {1}", file.name, name)
            return name
        },
        async generateImageUrl(url, file){
            if(url && url.includes(Vue.Constants.STORAGE_PROVIDER)){   //Is Internal Url, no need to upload
                return url
            }

            let fileName = this.generateImageName(file)
            url = await uploadImageFileToS3(this.deploy_to, this.$store.getters.getToken, file, fileName)
            return url
        },
        updateImageDimensions(){
            const {naturalHeight, naturalWidth} = this.$refs.currentImg.image;
            this.currentImgWidth = naturalWidth
            this.currentImgHeight = naturalHeight
        },
        openImageSelectionComponent(){
            let mainImg = {url: this.currentIngredient.img}
            this.$modal.show(
                ImageSelection,
                {initialMainUrl: mainImg, initialAlternativeImages: []},
                { width: "70%", height: "auto", adaptive: true, scrollable: true},
                { 'before-close': this.callbackFromImageSelection }
            );
        },
        callbackFromImageSelection(event){
            if(event && event.params && event.params.allImages && event.params.allImages.length){
                this.currentIngredient.img = event.params.allImages[0].url
                this.uploadedFile = event.params.allImages[0].file
            }
        },
    },

    created (){
        axios.get(this.deploy_to + 'backoffice/ingredients/',{headers: {
              'Authorization': `${this.$store.getters.getTokenToSend}`
        }}).then(resp => {
            this.ourIngredients = resp.data
        }).catch(errors => {
            console.log(errors)
            this.showErr(errors)
        })
        
        axios.get(this.deploy_to + 'category/', {headers: {
            'Authorization': `Token ${this.$store.getters.getToken}`}})
        .then(resp => {
            this.categories = resp.data.results
        }).catch(errors => {
            console.log(errors)
            this.showErr(errors)
        })

        axios.get(this.deploy_to + 'diet/', {headers: {
                'Authorization': `Token ${this.$store.getters.getToken}`
        }}).then(resp => {
            this.diets = resp.data.results
        }).catch(errors => {
            this.showErr(errors)
            console.log(errors)
        })

        console.log(this.currentIngredient)
    },

}
</script>

<style scoped>
</style>