<template>
    <v-container style="margin: 0px; padding: 0px; max-width: 100%; height:100%" fluid >

        <!-- CONFIRMATION DIALOG -->
        <div>
            <vue-confirm-dialog></vue-confirm-dialog>
            <!-- your code -->
        </div>


        <v-row class="ma-0 fill-height">
            <v-col cols="4" class="ma-0 pa-0 flex-grow-0">

                <!-- RECIPE METADATA -->
                <v-card class="meta-container fill-height px-5 py-1 flex-grow-0">
                    <v-row class="mx-3" align="center" justify="center">
                        <v-text-field class="shrink" v-model="importId" type="number" label="Import existing recipe" placeholder="Recipe ID"></v-text-field>
                        <v-btn class="mx-3" depressed small @click="importInternalRecipe">Import</v-btn>
                    </v-row>
                    <v-card-title style="word-break: normal">Very good Recipe that Ricardo's Mother doesn't know</v-card-title>
    
                    <!-- IMAGE -->

                    <v-row no-gutters v-show="images.length" align="center" justify="center">
                        <v-col cols="1">
                            <v-btn v-if="imgIndex > 0" icon v-on:click="navigateImages(-1)">
                                <v-icon large>mdi-menu-left-outline</v-icon>
                            </v-btn>
                        </v-col>
                        <v-col cols="9">
                            <v-img ref="currentImg" contain height="200px" :src="images[imgIndex] ? images[imgIndex].url : ''" @load="updateImageDimensions()"></v-img>
                        </v-col>
                        <v-col cols="1">
                            <v-btn v-if="imgIndex < images.length - 1" icon v-on:click="navigateImages(1)">
                                <v-icon large >mdi-menu-right-outline</v-icon>
                            </v-btn> 
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
                    <v-btn @click="openImageSelectionComponent">OPEN IMAGE SELECTION</v-btn>

                    <v-form>
                        <v-container class="mt-5 pa-0">
                            <v-row class="px-2">
                                <v-col cols="12" class="pa-0 ma-0">
                                    <v-text-field class="pa-0" label="Recipe Name" v-on:blur="checkSimilarRecipeNames" v-model="recipeName"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <b-alert variant="danger" v-if="this.similarNamesErr" show dismissible>{{this.similarNamesErr}}</b-alert>
                                </v-col>
                                <v-col cols="6" class="pa-0 ma-0">
                                    <v-select class="pa-0" label="Dish" v-model="dish"
                                        :items="getDishTypes()"
                                        item-text="name"
                                        item-value="id">
                                    </v-select>
                                </v-col>
                                <v-col cols="6" class="pa-0 pl-1 ma-0">
                                    <v-select class="pa-0" label="Difficulty" v-model="difficulty"
                                        :items="difficultyOptions">
                                    </v-select>
                                </v-col>
                                <v-col cols="4" class="pa-0 ma-0">
                                    <v-text-field class="pa-0" v-model="prepTime" type="number" label="PrepTime"></v-text-field>
                                </v-col>
                                <v-col cols="4" class="pa-0 pl-1 ma-0">
                                    <v-text-field class="pa-0" v-model="totalTime" type="number" label="TotalTime"></v-text-field>
                                </v-col>
                                <v-col cols="4" class="pa-0 pl-1 ma-0">
                                    <v-text-field class="pa-0" v-model="numberServes" type="number" label="People"  @click:append-outer="incrementServes" @click:prepend="decrementServes"></v-text-field>
                                </v-col>
                                <v-col cols="12" class="pa-0 ma-0">
                                    <v-textarea class="pa-0" rows="3" label="Description" v-model="description">

                                    </v-textarea>
                                </v-col>
                                <v-col cols="12" class="pa-0 ma-0">
                                        <v-text-field v-model="sourceUrl" label="External url source"></v-text-field>
                                </v-col>
                                <v-col cols="12" justify="center">
                                    <v-btn color="red lighten-4 mr-5" v-confirm="{ok: clearForms, message: 'Clearing recipe, are you sure?'}">
                                        CLEAR
                                    </v-btn>
                                    <v-btn class="ml-5" color="green" v-confirm="{ok: submitRecipe, message: 'Are you sure?'}">
                                        {{ submitButtonText() }}
                                    </v-btn>
                                </v-col>
                                <v-col cols="12">
                                    <b-alert variant="danger" v-if="this.err" show>{{this.err}}</b-alert>
                                    <b-alert variant="success" v-if="this.success" show>{{this.success}}</b-alert>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card>
            </v-col>

            
            <!-- RECIPE -->
            <v-col cols="8" class="ma-0 pa-0 flex-grow-1">
                <v-card class="fill-height px-5 pt-8">
                    <v-form>
                        <v-container>
                            
                            <!-- ADD NEW INGREDIENT -->
                            <v-row>
                                <v-col cols="12">
                                    <v-card>
                                        <v-card-title>Add Ingredients
                                            <v-col class="text-right">
                                                <v-btn @click="showIngredientTextBox = !showIngredientTextBox" icon color="indigo"><v-icon>mdi-text-box-outline</v-icon></v-btn>
                                            </v-col>
                                        </v-card-title>

                                        <v-row v-show="showIngredientTextBox" no-gutters class="mx-3 my-0">
                                            <!-- ADD MASS INGREDIENTS AS TEXT BOX  -->
                                            <v-col cols="11">
                                                <v-textarea auto-grow v-model="massIngredientsText"></v-textarea>
                                            </v-col>
                                            <v-col cols="1">
                                                <v-row justify="center">
                                                    <v-btn @click="massIngredientsText = massIngredientsText.replace(/\(.*?\)/g,''); replaceMeasuresInText();" icon><v-icon>mdi-content-cut</v-icon></v-btn>
                                                </v-row>
                                            </v-col>
                                        </v-row>

                                        <v-row no-gutters v-show="!showIngredientTextBox">
                                             <!-- ADD INDIVIDUAL INGREDIENT  -->
                                            <v-row class="mx-3 my-0">
                                                <v-col cols="3">
                                                    <v-select label="Measure" v-model="measure"
                                                                                :items="getMeasures()"
                                                                                item-text="name"
                                                                                clearable
                                                                                return-object>
                                                    </v-select>
                                                </v-col>
                                                <v-col cols="2">
                                                    <v-text-field label="Quantity" type="Number"  class="ml-3" v-model="quantity">

                                                    </v-text-field>
                                                </v-col>
                                                <v-col cols="6">
                                                    <v-autocomplete class="ml-3"
                                                        v-model="currentIngredient"
                                                        :items="getIngredients()"
                                                        color="white"
                                                        hide-no-data
                                                        hide-selected
                                                        item-text="name"
                                                        label="Ingredients"
                                                        placeholder="Type to search"
                                                        return-object
                                                    ></v-autocomplete>
                                                </v-col>
                                                <v-col cols="1">
                                                    <v-checkbox v-model="optional" label="Opt"></v-checkbox>
                                                </v-col>
                                            </v-row>
                                            <v-row no-gutters>
                                                <v-col cols="12">
                                                    <v-btn icon color="grey" @click="toggleAddIngredientAdvOptions"><v-icon>mdi-arrow-expand-down</v-icon></v-btn>
                                                </v-col>
                                            </v-row>
                                            <v-row no-gutters class="mx-3 pa-0" v-if="expandAddIngredientOptions">
                                                <v-col cols="12">
                                                    <v-text-field label="Notes" v-model="ingredientNotes"></v-text-field>
                                                </v-col>
                                                <v-col cols="6">
                                                    <v-select @change="changeIngredientGroup" clearable label="Select group" :items="recipeGroups">
                                                        
                                                    </v-select>
                                                </v-col>
                                                <v-col cols="6">
                                                    <v-text-field class="mx-3" label="New Group" v-model="newRecipeGroup"></v-text-field>
                                                    <v-btn @click="addNewGroup">New Group</v-btn>
                                                </v-col>
                                            </v-row>
                                        </v-row>
                                        <v-row justify="center">
                                            <v-col cols="2">
                                                <v-btn color="green" @click="addIngredient">Add</v-btn>
                                            </v-col>
                                        </v-row>
                                        <v-row no-gutters justify="center" v-if="this.addedIngredientErr">
                                            <b-alert variant="danger" show>{{this.addedIngredientErr}}</b-alert>
                                        </v-row>
                                        <v-row justify="center">
                                            <v-col cols="5">
                                                <v-divider style="color: red"></v-divider> 
                                            </v-col>
                                        </v-row>
                                        <v-row no-gutters v-show="this.added_ingredients.length > 0" justify="center">
                                            <p>Added ingredients <span>({{ this.added_ingredients.length }})</span></p>
                                        </v-row>
                                        
                                        <!-- ADDED INGREDIENTS LIST -->
                                        <v-row no-gutters>
                                            <v-col cols="12" no-gutters>
                                                <div v-for="(recipeIngredient, index) in added_ingredients" :key="index">
                                                        <!-- SHOW INGREDIENT IN EDIT MODE -->
                                                        <div v-show="recipeIngredient.editMode" :class="{'lightgray pa-2': index % 2 === 0, 'lavendergray pa-2': index % 2 !== 0}" >
                                                            <v-row v-show="recipeIngredient.originalMeasure !== null" no-gutters>
                                                                <span>External Measure: <strong>{{ recipeIngredient.originalMeasure }}</strong> </span>
                                                            </v-row>
                                                            <v-row v-show="recipeIngredient.originalIngredient !== null" no-gutters styl>
                                                                <span>External Ingredient: <strong>{{ recipeIngredient.originalIngredient }}</strong> </span>
                                                                <v-btn @click="addNewIngredient(recipeIngredient.originalIngredient, index)" v-show="!recipeIngredient.editData.ingredient.id" rounded  x-small color="success" style="margin-left: 15px">
                                                                    Add New Ingredient
                                                                </v-btn>
                                                            </v-row>
                                                            <v-row v-show="recipeIngredient.originalNotes" no-gutters>
                                                                <span>External Ingredient Notes: <strong>{{ recipeIngredient.originalNotes }}</strong> </span>
                                                            </v-row>
                                                            <v-row v-show="ingredientHasGroup(recipeIngredient.group)" no-gutters>
                                                                <span>Ingredient Group: <font color="sienna"><strong>{{ recipeIngredient.group }}</strong></font> </span>
                                                            </v-row>
                                                            <v-row no-gutters class="mt-1">
                                                                <v-col cols="2">
                                                                    <v-select label="Measure" v-model="recipeIngredient.editData.measure"
                                                                                                :items="getMeasuresWithSuggestionBias(recipeIngredient)"
                                                                                                item-text="name"
                                                                                                return-object
                                                                                                :clearable="true">
                                                                    </v-select>
                                                                </v-col>
                                                                <v-col cols="2">
                                                                    <v-text-field class="ml-3" label="Qnt" type="Number" v-model="recipeIngredient.editData.quantity">

                                                                    </v-text-field>
                                                                </v-col>
                                                                <v-col cols="4">
                                                                    <v-autocomplete
                                                                        class="ml-3"
                                                                        v-model="recipeIngredient.editData.ingredient"
                                                                        :items="getIngredientWithSuggestionBias(recipeIngredient)"
                                                                        item-text="name"
                                                                        label="Ingredients"
                                                                        placeholder="Type to search"
                                                                        return-object
                                                                    ></v-autocomplete>
                                                                </v-col>
                                                                <v-col cols="1">
                                                                    <v-checkbox class="ml-3" v-model="recipeIngredient.editData.optional" label="Opt"></v-checkbox>
                                                                </v-col>
                                                                <v-col cols="3">
                                                                    <v-btn icon color="green" @click="saveAddedIngredientEditing(recipeIngredient)"><v-icon>mdi-check</v-icon></v-btn>

                                                                    <v-btn icon color="black" @click="togleIngredientEditMode(recipeIngredient)"><v-icon>mdi-arrow-left</v-icon></v-btn>

                                                                    <v-btn icon color="red" @click="removeRecipeIngredient(index)"><v-icon>mdi-delete-forever</v-icon></v-btn>
                                                                </v-col>
                                                            </v-row>
                                                            
                                                            <v-row no-gutters>
                                                                <v-btn icon color="grey" @click="toggleEditIngredientAdvOptions(recipeIngredient)"><v-icon>mdi-arrow-expand-down</v-icon></v-btn>
                                                            </v-row>
                                                            
                                                            <v-row no-gutters v-show="recipeIngredient.editData.advOptions">
                                                                <v-col cols="12">
                                                                    <v-text-field label="Notes" v-model="recipeIngredient.editData.notes" clearable></v-text-field>
                                                                </v-col>
                                                                <v-col cols="6" >
                                                                <v-select v-model="recipeIngredient.editData.group" clearable label="Select group" :items="recipeGroups">
                                                    
                                                                </v-select>
                                                                </v-col>
                                                                <v-col cols="6">
                                                                    <v-text-field class="mx-3" label="New Group" v-model="newRecipeGroup"></v-text-field>
                                                                    <v-btn @click="addNewGroup">New Group</v-btn>
                                                                </v-col>
                                                            </v-row>
                                                            <v-row no-gutters >

                                                            </v-row>
                                                            <v-row no-gutters>
                                                                <p style="color:red"> {{ recipeIngredient.error }} </p>
                                                            </v-row>
                                                        </div>
                                                        <!-- SHOW INGREDIENT IN SIMPLE MODE -->
                                                        <div v-show="!recipeIngredient.editMode" class="text-left pa-1">
                                                            <span v-if="recipeIngredient.group">Group: <strong>{{ recipeIngredient.group }}</strong></span>
                                                            <span class="mx-2" >{{recipeIngredient.measure.name}}</span>
                                                            <span class="mx-2">{{recipeIngredient.quantity}}</span>
                                                            <span class="mx-2">{{recipeIngredient.ingredient.name}}</span>
                                                            <span v-if="recipeIngredient.notes" class="mx-2" style="color: grey">( {{recipeIngredient.notes}} )</span>
                                                            <span v-text="recipeIngredient.optional ? 'optional' : 'required'"></span>
                                                            <v-btn class="ml-4" x-small icon color="black" @click="togleIngredientEditMode(recipeIngredient)">
                                                                <v-icon>mdi-pencil</v-icon>
                                                            </v-btn>
                                                            <v-btn class="mx-1" x-small icon color="red" @click="removeRecipeIngredient(index)">
                                                                <v-icon>mdi-delete-forever</v-icon>
                                                            </v-btn>
                                                        </div>
                                                </div>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <!-- INSTRUCTIONS LIST -->
                            <v-row>
                                <v-col cols="12">
                                    <v-card class="pa-5">
                                        <v-card-title>Instructions (one per line)</v-card-title>
                                        <v-textarea auto-grow v-model="raw_instructions">

                                        </v-textarea>
                                    </v-card>
                                </v-col>
                            </v-row>

                            <v-img v-if="urlToLoadTmpImage" contain height="200px" :src="urlToLoadTmpImage"></v-img>
                        
                        </v-container>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios'
import Vue from 'vue'
import { getSignedUrl, uploadImageFileToS3} from '@/helpers/s3-image-storage'
import { mapExternalMeasures, mapExternalIngredients, getSimilarRecipesByTitle } from '@/helpers/searchModelsBySimilarity'
import AddIngredientCore from '../Ingredient/AddIngredientCore.vue'
import ImageSelection from '../UtilityComponents/ImageSelection.vue'

var utils = require('../../utils');

export default {
    name: "AddRecipe",
    components: {
        AddIngredientCore,
        ImageSelection
    },
    data(){
        return {
            deploy_to : process.env.VUE_APP_DATABASE,
            recipeName: null,
            dish: null,
            difficulty: null,
            numberServes: null,
            prepTime: null,
            totalTime: null, 
            difficultyOptions: ['Easy', 'Medium', 'Hard'],
            description: null,
            currentIngredient: null,
            measure:null,
            quantity:null,
            ingredientNotes: '',
            optional: false,
            added_ingredients: [],
            raw_instructions: null,
            possible_ingredients:[],
            possible_measures:[],
            possible_dishes: [],
            err: null,
            similarNamesErr: null,
            addedIngredientErr: null,
            success: null,
            importId: null,
            externalRecipe: null,
            expandAddIngredientOptions: false,
            ingredientGroup: "",
            recipeGroups: [],
            newRecipeGroup: "",
            urlToLoadTmpImage: "",
            tmpFile: undefined,
            sourceUrl: "", //For external urls
            showIngredientTextBox: false,
            massIngredientsText: "",

            //When add new ingredient popup appears
            popupShowAddIngredient: false,
            popupIngredientName: null,

            images: [],   //List of all images {url, file}, first is main image
            imgIndex: 0,

            currentImgWidth: 0,
            currentImgHeight: 0
        }
    },
    watch: {
        added_ingredients : {
            handler(val){
                this.updateStoreCurrentRecipe()
            },
            deep: true
        },
        raw_instructions : {
            handler(val){
                this.updateStoreCurrentRecipe()
            },
            deep: true
        },
        recipeName : {
            handler(val){
                this.updateStoreCurrentRecipe()
            },
            deep: true
        },
        difficulty : {
            handler(val){
                this.updateStoreCurrentRecipe()
            },
            deep: true
        },
        images : {
            handler(val){
                this.updateStoreCurrentRecipe()
            },
            deep: true
        }

    },
    async mounted (){

        //IMPORT FROM VUEX
        if(this.verifyImportRecipe())
            console.log("importing internal recipe")
        else if (this.verifyFetchExternalRecipe()) 
            console.log("importing external recipe")
        else if (this.verifyCurrentRecipeFromStore())
            console.log("restoring current recipe")

        const requestIngredient = axios.get(this.deploy_to + 'backoffice/ingredients/', {headers: {
                'Authorization': `${this.$store.getters.getTokenToSend}`
        }} )
        const requestMeasure = axios.get(this.deploy_to + 'measure/', {headers: {
                'Authorization': `${this.$store.getters.getTokenToSend}`
        }})
        
        const requestDishes = axios.get(this.deploy_to + 'dishtype/',{headers: {
                'Authorization': `${this.$store.getters.getTokenToSend}`
        }})

        await axios.all([requestIngredient, requestMeasure, requestDishes],{headers: {
                    'Authorization': `Token ${this.$store.getters.getToken}`
                }})
            .then(axios.spread( (...responses) => {
                this.possible_ingredients = responses[0].data
                this.possible_measures = responses[1].data.results
                this.possible_dishes = responses[2].data.results
            })).catch(errors => {
                console.log("ERROR request tables: " +  errors)
            })
        
    },
    methods: {
        showErr(msg, timeout=5000){
          this.err = msg
          setTimeout(() => this.err = null, timeout);
        },
        showSimilarNamesErr(msg){
            this.similarNamesErr = msg
            setTimeout(() => this.similarNamesErr = null, 15000);
        },
        showAddedIngredientErr(msg){
          this.addedIngredientErr = msg
          setTimeout(() => this.addedIngredientErr = null, 2000);
        },
        showEditIngredientErr(recipeIngredient, msg){
            recipeIngredient.error = msg;
            setTimeout(() => recipeIngredient.error = null, 2000);
        },
        showSuccess(msg){
            this.success = msg
            setTimeout(() => this.success = null, 5000);
        },
        clearForms(){
            this.importId = null
            this.recipeName = null
            this.url = null
            this.file = null
            this.images = []
            this.description = null
            this.dish = null
            this.numberServes = null
            this.prepTime = null
            this.totalTime = null
            this.difficulty = null
            this.added_ingredients = []
            this.instructions = []
            this.measure = null
            this.quantity = null
            this.optional = false
            this.sourceUrl = ""
            this.raw_instructions = null
            this.massIngredientsText = ""
            this.resetIngredientsForm()
            this.$store.commit('updateCurrentRecipe', null)
        },
        async submitRecipe(){

            if(!this.validateRecipe()){
                return;
            }

            //Get all images as an internal url (S3)
            let uploadedImages = []
            for(const i of this.images){

                //Add alternative images only when enabled
                if(uploadedImages.length == 0 || i.enabled){
                    let url = await this.generateImageUrl(i.url, i.file)
                    uploadedImages.push(url)
                }
            }
            
            const mainImageUrl = uploadedImages.shift()
            const alternativeImages = uploadedImages

            const recipe = {
                id: this.importId,
                name : this.recipeName,
                image : mainImageUrl,
                alternativeImages: alternativeImages,
                description : this.description,
                dishType: this.dish,
                difficulty : this.getDifficultyValue(),
                serves : this.numberServes,
                prepareInMinutes : this.prepTime,
                readyInMinutes : this.totalTime,
                recipeIngredients: this.parseRecipeIngredients(),
                instructions: this.parseInstructions(),
                source_url: this.sourceUrl,
                is_valid : true
            }

            console.log(recipe);

            if(this.importId == null || this.importId < 1){ //NEW RECIPE
                this.sendNewRecipeRequest(recipe)
            } else {    //UPDATE
                this.sendUpdateRecipeRequest(recipe, this.importId)
            }
        },
        sendUpdateRecipeRequest(recipe, id){
            recipe["id"] = id
            axios.patch(this.deploy_to + 'recipe/' + id + '/', recipe, {headers: {
                    'Authorization': `Token ${this.$store.getters.getToken}`}})
                .then((response) => {
                    this.showSuccess("Recipe Updated Successfully ")
                    this.clearForms()
                })
                .catch(errors => {
                    if(errors.response){
                        console.log(errors.response.data)
                        this.showErr("Error on insert due to fields: " + Object.keys(errors.response.data).join(', '), 10000)
                    }
                    else {
                        this.showErr("Error updating recipe: unknown")
                    }
                })
        },
        async sendNewRecipeRequest(recipe){
            axios.post(this.deploy_to + 'recipe/', recipe,{headers: {
                'Authorization': `Token ${this.$store.getters.getToken}`}})
            .then((response) => {
                this.showSuccess("Recipe Added with id: " + response.data.id)
                this.clearForms()
            })
            .catch(errors => {
                if(errors.response){
                    console.log(errors.response.data)
                    this.showErr("Error on insert due to fields: " + Object.keys(errors.response.data).join(', '), 10000)
                } else {
                    this.showErr("Error inserting recipe: unknown")
                }
            })
        },
        async checkSimilarRecipeNames(){
            const suspectRecipes = await getSimilarRecipesByTitle(this.recipeName, this.deploy_to, `Token ${this.$store.getters.getToken}`)
            if(suspectRecipes){
                let similarRecipes = suspectRecipes.filter(r => r.similarity >= 0.4).map(r => r.name)

                if(Array.isArray(similarRecipes) && similarRecipes.length){
                    console.log(similarRecipes)
                    this.showSimilarNamesErr("SIMILAR RECIPES: " + similarRecipes.join(', '), 5 * 60 * 1000)
                }
            }
        },
        //Used to tmp store downloaded external images
        setLocalUrl(url){
            this.urlToLoadTmpImage = url;
        },
        setLocalFile(file){
            this.tmpFile = file
        },
        async generateImageUrl(url, file){
            if(url && url.includes(Vue.Constants.STORAGE_PROVIDER)){   //Is Internal Url, no need to upload
                return url
            }

            if(file){
                let fileName = this.generateImageName(file)
                url = await uploadImageFileToS3(this.deploy_to, this.$store.getters.getToken, file, fileName)
                return url
            }

            //External Url
            if(url){
                const delay = ms => new Promise(res => setTimeout(res, ms));
                utils.downloadImageFile(url, this)
                while(!this.tmpFile){
                    await delay(100) 
                }
                const fileName = this.generateImageName(this.tmpFile)
                url = await uploadImageFileToS3(this.deploy_to, this.$store.getters.getToken, this.tmpFile, fileName)
                this.tmpFile = null
                return url
            }
        },
        generateImageName(file){
            const fileExtension = "." + file.name.split('.').pop();
            const randomInt = "_" + Math.floor(Math.random() * 10000)
            return this.recipeName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + randomInt + fileExtension
        },
        verifyIngredientUniqueInRecipe(ingredientId){
            for(var i = 0; i < this.added_ingredients.length; i++){
                if(this.added_ingredients[i].ingredient.id === ingredientId){
                    return false;
                }
            }
            return true;
        },
        addIngredient(){
            if(!this.showIngredientTextBox){
                this.addSimpleIngredient();
            } else {
                this.addMassIngredientsFromText();
            }
        },
        addMassIngredientsFromText(){
            if(this.massIngredientsText == "")
                return;
            
            var externalIngredientList = []
            let splitIngredients = this.massIngredientsText.split('\n')
            splitIngredients.forEach(iLine => {
                iLine.trim()
                let originalIngredientText = iLine

                let quantityOptional = iLine.match(/\d+/)
                let quantity = quantityOptional ? quantityOptional[0] : ''

                iLine = iLine.replace(quantity, '').trimStart()
                var measure = iLine.substring(0, iLine.indexOf(' '))
                let measureMapping = this.getMeasureTextMapping();
                if(measure && measureMapping[measure]){
                    measure = measureMapping[measure]
                } else if(measure){
                    //measure not found in mapping, undo
                    iLine = measure + " " + iLine
                    measure = ''
                }

                iLine = iLine.replace(measure, '').trimStart()
                let ingredient = iLine
                let ingredientObj = {
                    quantity: quantity,
                    measure: measure.trim(),
                    name: ingredient.trim(),
                    notes: "",
                    textIngredient: originalIngredientText
                }
                externalIngredientList.push(ingredientObj)
            })
            console.log(externalIngredientList)
            this.importExternalIngredients({'ingredients': externalIngredientList})
        },
        addSimpleIngredient(){

            if(!this.validateIngredientFields(this.measure, this.quantity, this.currentIngredient)){
                this.showAddedIngredientErr("Ingredient fields are incorrect")
                return;
            }

            //Fill default none measure
            if(!this.measure){
                this.measure = this.getDefaultNoneMeasure();
            }

            //Fill default none quantity 
            if(!this.quantity){
                this.quantity = -1
            }

            var recipeIngredient = {
                measure: this.measure,
                quantity: this.quantity,
                optional: this.optional,
                ingredient: {id: this.currentIngredient.id, name: this.currentIngredient.name},
                notes: this.ingredientNotes ? this.ingredientNotes : "",
                group: this.ingredientGroup ? this.ingredientGroup : "",
                editMode: false,
                editData : { measure: this.measure, quantity: this.quantity, optional: this.optional, ingredient: {id: this.currentIngredient.id, name: this.currentIngredient.name}, notes: this.ingredientNotes, group: this.ingredientGroup},
                error : null
            }
            this.added_ingredients.push(recipeIngredient)
            this.resetIngredientsForm();
        },
        removeRecipeIngredient(index){
            this.added_ingredients.splice(index, 1)
        },
        resetIngredientsForm(){
            this.currentIngredient = null
            this.optional = false
            this.ingredientNotes = ""
            this.measure = null
            this.quantity = null
        },
        togleIngredientEditMode(recipeIngredient){
            recipeIngredient.editMode = !recipeIngredient.editMode;
            //Reset edit data
            recipeIngredient.editData = { measure: recipeIngredient.measure, quantity: recipeIngredient.quantity, optional: recipeIngredient.optional, ingredient: {id: recipeIngredient.ingredient.id, name: recipeIngredient.ingredient.name}, notes: recipeIngredient.notes, group: recipeIngredient.group, advOptions: false}
        },
        saveAddedIngredientEditing(recipeIngredient){
            if(recipeIngredient.editMode){
                
                if(!this.validateIngredientFields(recipeIngredient.editData.measure, recipeIngredient.editData.quantity, recipeIngredient.editData.ingredient)){
                    this.showEditIngredientErr(recipeIngredient, "Ingredient is too incomplete")
                    return;
                }

                let newMeasure = recipeIngredient.editData.measure;
                let newIngredient = recipeIngredient.editData.ingredient;
                
                recipeIngredient.quantity = recipeIngredient.editData.quantity > 0 ? recipeIngredient.editData.quantity : -1
                recipeIngredient.optional = recipeIngredient.editData.optional
                recipeIngredient.measure = newMeasure ? newMeasure : this.getDefaultNoneMeasure()
                recipeIngredient.ingredient = newIngredient !== null ? newIngredient : this.getDefaultEmptyObject()
                recipeIngredient.notes = recipeIngredient.editData.notes
                recipeIngredient.group = recipeIngredient.editData.group
                this.togleIngredientEditMode(recipeIngredient)
            }
        },
        incrementServes () {
            this.numberServes = parseInt(this.numberServes, 10) + 1
        },
        decrementServes () {
            this.numberServes = parseInt(this.numberServes, 10) - 1
        },
        incrementTime () {
            this.time = parseInt(this.time, 10) + 1
        },
        decrementTime () {
            this.time = parseInt(this.time, 10) - 1
        },
        getDishTypes(){
            //Wait for server to respond
            var wait = (ms) => new Promise((r) => setTimeout(r, ms));
            wait(1000).then(() => {
                return this.possible_dishes;
            });
            return this.possible_dishes;
        },
        getMeasures() {
            //Wait for server to respond
            var wait = (ms) => new Promise((r) => setTimeout(r, ms));
            wait(1000).then(() => {
                return this.possible_measures;
            });
            return this.possible_measures;
        },
        getIngredients() {
            //Wait for server to respond
            var wait = (ms) => new Promise((r) => setTimeout(r, ms));
            wait(1000).then(() => {
                return this.possible_ingredients;
            });
            return this.possible_ingredients;
        },
        //Return measure options with suggestions appearing first
        getMeasuresWithSuggestionBias(recipeIngredient){

            if(!recipeIngredient || !recipeIngredient.measureOptions || !Array.isArray(recipeIngredient.measureOptions) || recipeIngredient.measureOptions.length == 0)
                return this.possible_measures;

            let measuresSuggested = recipeIngredient.measureOptions;
            
            let otherMeasures = this.possible_measures.filter(m => {
                if(measuresSuggested.filter(m2 => m2.id === m.id).length > 0){
                    return false
                }
                return true
            });
            return measuresSuggested.concat(otherMeasures);
        },
        //Return ingredient options with suggestions appearing first
        getIngredientWithSuggestionBias(recipeIngredient){

            if(!recipeIngredient || !recipeIngredient.ingredientOptions || !Array.isArray(recipeIngredient.ingredientOptions) || recipeIngredient.ingredientOptions.length == 0)
                return this.possible_ingredients;

            let ingredientsSuggested = recipeIngredient.ingredientOptions;

            let otherIngredients = this.possible_ingredients.filter(i => {
                if(ingredientsSuggested.filter(i2 => i.id === i2.id).length > 0){
                    return false
                }
                return true
            });
            
            return ingredientsSuggested.concat(otherIngredients);
        },
        getDefaultEmptyObject(){
            return { id : null, name: "" }
        },
        getDifficultyValue(){
            return this.difficultyOptions.indexOf(this.difficulty) + 1;
        },
        verifyCurrentRecipeFromStore(){
            const currentRecipe = this.$store.getters.getCurrentRecipe
            if(currentRecipe){
                this.importId = currentRecipe.importId
                this.recipeName = currentRecipe.recipeName
                this.images = currentRecipe.images
                this.description = currentRecipe.description
                this.dish = currentRecipe.dish
                this.difficulty = currentRecipe.difficulty
                this.numberServes = currentRecipe.numberServes
                this.prepTime = currentRecipe.prepTime
                this.totalTime = currentRecipe.totalTime
                this.added_ingredients = currentRecipe.added_ingredients
                this.raw_instructions = currentRecipe.raw_instructions
                this.sourceUrl = currentRecipe.sourceUrl
            }
        },
        verifyFetchExternalRecipe(){
            const externalRecipe = this.$store.getters.getExternalRecipe
            if(externalRecipe != null){
                this.externalRecipe = externalRecipe
                this.$store.commit('newExternalRecipe', null)  //RESET VALUE
                this.importExternalRecipe()
                this.checkSimilarRecipeNames()
                return true
            }
            return false
        },
        verifyImportRecipe(){
            const editRecipeId = this.$store.getters.getRecipeToEdit
            if(editRecipeId != null && editRecipeId > 0){
                this.importId = editRecipeId
                this.$store.commit('editRecipe', null)  //RESET VALUE
                this.importInternalRecipe()
                return true
            }
            return false
        },
        async importInternalRecipe(){

            const recipe = await axios.get(this.deploy_to + `recipe/${this.importId}`, {headers: {'Authorization': `Token ${this.$store.getters.getToken}`}})
                                .then(resp => resp.data)
                                .catch(errors => {
                                    console.log("Error importing recipe: " + errors)
                                })

            if(recipe != undefined){
                this.recipeName = recipe.name
                this.dish = recipe.dishType != null ? recipe.dishType.id : null
                this.difficulty = this.difficultyOptions[recipe.difficulty-1]
                this.numberServes = recipe.serves
                this.prepTime = recipe.prepareInMinutes
                this.totalTime = recipe.readyInMinutes
                this.description = recipe.description
                this.added_ingredients = this.importAddedIngredients(recipe.ingredients)
                this.sourceUrl = recipe.source_url
                this.importInternalInstructions(recipe.instructions)
                this.buildImages(recipe.image, recipe.alternativeImages)
            }
        },
        importAddedIngredients(ingredients){
            console.log(ingredients)
            var addedIngredients = []
            ingredients.forEach(i => {
                var recipeIngredient = {
                    measure: {id: i.measure, name: i.measureName},
                    quantity: i.quantity,
                    optional: i.optional,
                    ingredient: {id : i.ingredient, name: i.ingredientName},
                    group: i.group,
                    notes: i.notes,
                    editData : { measure: null, quantity: undefined, optional: false, ingredient: {id: null, name: ""}, notes : "", group: "", advOptions: false},
                    editMode: false,
                }
                addedIngredients.push(recipeIngredient)

                if(i.group && !this.recipeGroups[i.group]) 
                    this.recipeGroups.push(i.group)
            })
            return addedIngredients
        },
        importInternalInstructions(instructions){
            var groupedInstructions = {}
            //Build instruction map per group
            instructions.forEach(i => {
                //Default group
                if(!i.group)
                    (groupedInstructions["default"] = groupedInstructions["default"] || []).push(i.instruction_description)
                else
                    (groupedInstructions[i.group] = groupedInstructions[i.group] || []).push(i.instruction_description)
            });
            console.log(groupedInstructions)
            //transfer instructions to text-area in group blocks

            //start with default group
            this.raw_instructions = ""
            if(groupedInstructions["default"]){
                groupedInstructions["default"].forEach(i => {
                    this.raw_instructions += i + "\n"
                });
                delete groupedInstructions["default"];
            }

            Object.keys(groupedInstructions).forEach(key => {
                this.raw_instructions += "\n#" + key + "\n"
                groupedInstructions[key].forEach(i => {
                    this.raw_instructions += i + "\n"
                })
            })

            

            
        },
        importExternalRecipe(){
            const recipe = this.externalRecipe
            if(recipe != null){
                this.recipeName = recipe.recipeName
                this.prepTime = recipe.prepTime
                this.totalTime = recipe.totalTime
                this.numberServes = recipe.servings
                this.description = recipe.description
                this.sourceUrl = recipe.sourceUrl
                this.buildImages(recipe.mainImageUrl, recipe.allImageUrls)
               
                //Insert instructions
                this.raw_instructions = ""
                var step = 1;
                for(var gIndex = 1; gIndex <= Object.keys(recipe.instructions).length; gIndex++){
                    let instructionGroup = recipe.instructions[gIndex]
                    let groupedInstructions = instructionGroup.instructions
                    if(instructionGroup.group !== "instructions") //Default Group
                        this.raw_instructions += '\n#' + instructionGroup.group + '\n'
                    while(groupedInstructions[step]){
                        this.raw_instructions += groupedInstructions[step] + '\n'
                        step++;
                    }
                }
                
                this.importExternalIngredients(recipe.ingredients)
                
            }
        },
        async importExternalIngredients(externalIngredients){
            //RECIPE.INGREDIENTS IN FORMAT: {'group': ingredientList}

            var allExternalMeasures = []
            var allExternalIngredients = []

            //Create lists with all measures and ingredients for mapping request
            for(const [key, value] of Object.entries(externalIngredients)){
                value.forEach(function(ingredientObject) {
                    allExternalMeasures.push(ingredientObject.measure);
                    allExternalIngredients.push(ingredientObject.name);
                })
            }

            //Fetch mappings from server
            const measureMapping = await mapExternalMeasures(allExternalMeasures, this.deploy_to, `Token ${this.$store.getters.getToken}`)
            const ingredientMapping = await mapExternalIngredients(allExternalIngredients, this.deploy_to, `Token ${this.$store.getters.getToken}`)
            console.log(ingredientMapping)
            for(const [key, value] of Object.entries(externalIngredients)){
                value.forEach(function(ingredientObject) {
                    let measureOptions = measureMapping[ingredientObject.measure]
                    let ingredientOptions = ingredientMapping[ingredientObject.name]
                    let ingredientGroup = key.replace(/[^a-zA-Z -]/g,"")
                    this.buildAddedIngredientFromExternalSource(measureOptions, ingredientObject.quantity, ingredientOptions, ingredientObject.measure, ingredientObject.textIngredient ? ingredientObject.textIngredient : ingredientObject.name, ingredientObject.notes, ingredientGroup);
                }, this)
            }

        },
        //Used to create Recipe Ingredient from external scraped ingredient
        //Can have multiple measure/ingredient options for manual selection
        //*ingredientGroup is used in some sources that divide ingredients by groups (e.g., 'sauce', 'serve with')
        buildAddedIngredientFromExternalSource(measureOptions, quantity, ingredientOptions, originalMeasure, originalIngredient, originalNotes, ingredientGroup){
            let recipeIngredient = {
                measure: {id: null, name: ""},
                quantity: quantity,
                optional: false,
                ingredient: {id : null, name: ""},
                notes: originalNotes,
                editData : { measure: null, quantity: quantity, optional: false, ingredient: {id: null, name: ""}, notes : "", group: ingredientGroup, advOptions: false},
                editMode: true,
                error : null,
                group: ingredientGroup,
                originalNotes: originalNotes,
                originalMeasure : originalMeasure, 
                originalIngredient : originalIngredient
            }

            if(Array.isArray(measureOptions) && measureOptions.length){
                recipeIngredient["measureOptions"] = measureOptions
                let bestMeasure = measureOptions[0]
                if(bestMeasure.similarity > 0.8)
                    recipeIngredient.editData.measure = bestMeasure
            }

            if(Array.isArray(ingredientOptions) && ingredientOptions.length){
                recipeIngredient["ingredientOptions"] = ingredientOptions
                let bestIngredient = ingredientOptions[0]
                if(bestIngredient.similarity > 0.8)
                    recipeIngredient.editData.ingredient = {id: bestIngredient.id, name: bestIngredient.name}
            }

            if(ingredientGroup && !this.recipeGroups[ingredientGroup])
                this.recipeGroups.push(ingredientGroup)

            this.added_ingredients.push(recipeIngredient);
        },
        submitButtonText(){
            if(this.importId == null || this.importId <= 0){
                return "Submit"
            }
            return "Update Recipe=" + this.importId
        },
        parseRecipeIngredients(){
            var recipeIngredients = []
            this.added_ingredients.forEach(function(item){
                var recipeIngredient = {
                    measure: item.measure.id,
                    quantity: item.quantity,
                    optional: item.optional,
                    notes: item.notes,
                    ingredient: item.ingredient.id,
                    group: item.group
                }
                recipeIngredients.push(recipeIngredient)
            })
            return recipeIngredients
        },
        parseInstructions(){
            //Instruction parsing is quite complex due to optional groups, new lines, etc
            //Might be simplified with regex if someone has time to figure it out

            //Groups start with #GROUP_NAME\n 

            if(this.raw_instructions == null)
                return []


            let allInstructions = this.raw_instructions.trimStart();
            let steps = 1;
            let parsedInstructions = []
            let nextGroupIndex = 0

            while(allInstructions.length > 0){

                if(allInstructions.startsWith("#")){ //Ignore first occurence, find 2nd index
                    nextGroupIndex = allInstructions.substring(1).indexOf('#') 
                } else {
                    nextGroupIndex = allInstructions.indexOf('#')
                }
                nextGroupIndex = nextGroupIndex > 0 ? nextGroupIndex : Number.MAX_VALUE //When no more groups exist, got to the end
                let groupName = ""
                let group = allInstructions.substring(0, nextGroupIndex)
                console.log(group)
                if(group.startsWith("#")){
                    //Group name is between # and \n
                    let endOfGroupName = group.indexOf("\n")
                    endOfGroupName = endOfGroupName > 0 ? endOfGroupName : Number.MAX_VALUE
                    groupName = group.substring(1, endOfGroupName).replace(/[^a-zA-Z -]/g,"");
                    group = group.substring(endOfGroupName) //extract group name from group
                }

                //Get all group instructions until another group (#) or EOF
                let groupedInstructions = group
                console.log(groupedInstructions)
                groupedInstructions.split("\n").forEach(instruction => {
                    var newInstruction = {
                        step: steps,
                        instruction_description: instruction,
                        group: groupName
                    }
                    if(newInstruction.instruction_description != ""){
                        parsedInstructions.push(newInstruction);
                        steps++;
                    }
                });
                allInstructions = allInstructions.substring(nextGroupIndex)
            }

            console.log(parsedInstructions)

            return parsedInstructions;
        },
        navigateImages(moveIndex){
            //Index 0 corresponds to main image
            const newIndex = this.imgIndex + moveIndex
            if(newIndex >= 0 && newIndex < this.images.length){
                this.imgIndex += moveIndex;
                this.url = this.images[newIndex]
            }
        },
        updateImageDimensions(){
            const {naturalHeight, naturalWidth} = this.$refs.currentImg.image;
            this.currentImgWidth = naturalWidth
            this.currentImgHeight = naturalHeight
        },
        addNewIngredient(ingredientName, index){
            this.$modal.show(
                AddIngredientCore,
                {initialName: ingredientName, parentRequestId: index},
                { width: "500", height: "auto", adaptive: true, scrollable: true},
                { 'before-close': this.ingredientAdded }
            );
            this.popupShowAddIngredient = true;
            this.popupIngredientName = ingredientName; 
        },
        ingredientAdded(event){
            let createdIngredient = event.params.paramList[0]
            let requestId = event.params.paramList[1]      //Ingredient Index In Recipe
            console.log("Returned from ingredient added successfully - " + createdIngredient.name + ", reqId:" + requestId)

            //Update ingredient list with new ingredient
            this.possible_ingredients.push(createdIngredient)

            //Update added ingredient edit data
            let addedIngredient = this.added_ingredients[requestId]
            addedIngredient.editData.ingredient = createdIngredient
            this.$set(this.added_ingredients, requestId, addedIngredient)
            
        },
        getConfirmationDialogMessage(){

        },
        validateRecipe(){
            if(this.recipeName == null || this.recipeName.length < 2){
                this.showErr("Name is too short");
                return false
            }
            if(this.dish == null){
                this.showErr("Please fill dish type");
                return false
            }
            if(this.description == null || this.description.length < 2){
                this.showErr("Please fill description");
                return false
            }
            if(this.difficulty == null || this.difficulty < 0){
                this.showErr("Please fill difficulty");
                return false
            }
            if(this.numberServes == null || this.numberServes < 1){
                this.showErr("Please fill people served number");
                return false
            }
            if(this.prepTime == null || this.totalTime == null || this.totalTime < 1 || this.prepTime < 1){
                this.showErr("Please fill recipe time correctly");
                return false
            }
            if(this.added_ingredients.length < 1){
                this.showErr("Please add ingredients");
                return false
            }
            //Can't have any ingredient in edit mode
            for(var i = 0; i < this.added_ingredients.length; i++){
                if(this.added_ingredients[i].editMode){
                    this.showErr("Ingredient " + this.added_ingredients[i].editData.ingredient.name + " is in edit mode. Please Validate.");
                    return false
                }
            }
            if(!this.raw_instructions){
                this.showErr("Please add instructions");
                return false
            }
            if(this.images.length == 0){
                this.showErr("Please choose at least one image")
                return false
            }
            return true
        },
        validateIngredientFields(measure, quantity, ingredient){
            //Must have an ingredient and either measure or quantity
            if(ingredient === null || ingredient.id === null)
                return false
            if((!measure || measure.id == null) && (!quantity || quantity === ""))
                return false
            return true
        },
        //*ingredientGroup is used in some sources that divide ingredients by groups (e.g., 'sauce', 'serve with')
        //the default group is 'ingredients'
        ingredientHasGroup(group){
            return !group || group !== 'ingredients'
        },
        toggleAddIngredientAdvOptions(){
            this.expandAddIngredientOptions = !this.expandAddIngredientOptions
        },
        toggleEditIngredientAdvOptions(ingredient){
            ingredient.editData.advOptions = !ingredient.editData.advOptions
        },
        addNewGroup(){
            this.recipeGroups.push(this.newRecipeGroup)
            this.newRecipeGroup = ""
        },
        changeIngredientGroup(selected){
            if(selected)
                this.ingredientGroup = selected
            else
                this.ingredientGroup = ""    
        },
        openImageSelectionComponent(){
            const mainImageUrl = this.images.length ? this.images[0] : {}
            const alternativeImages = this.images.slice(1)
            this.$modal.show(
                ImageSelection,
                {initialMainUrl: mainImageUrl, initialAlternativeImages: alternativeImages},
                { width: "70%", height: "auto", adaptive: true, scrollable: true},
                { 'before-close': this.callbackFromImageSelection }
            );
        },
        callbackFromImageSelection(event){
            if(event && event.params && event.params.allImages && event.params.allImages.length){
                this.images = event.params.allImages
                this.imgIndex = 0
            }
        },
        newImage(url, file = null){
            return {url: url, file: file, enabled: false}
        },
        buildImages(mainUrl, allUrls){
            this.images = []
            this.images.push(this.newImage(mainUrl))
            if(allUrls){
                allUrls.forEach(u => {
                    if(u !== mainUrl)
                        this.images.push(this.newImage(u, null))
                });
            }
            this.url = mainUrl
            this.file = null
            this.imgIndex = 0
        },
        getDefaultNoneMeasure(){
            for(var i = 0; i < this.possible_measures.length; i++){
                if(this.possible_measures[i].name === "none"){
                    return this.possible_measures[i]
                }
            }
            return null
        },
        updateStoreCurrentRecipe(){
            const recipe = {
                id: this.importId,
                recipeName : this.recipeName,
                images: this.images,
                description : this.description,
                dish: this.dish,
                difficulty : this.difficulty,
                numberServes : this.numberServes,
                prepTime : this.prepTime,
                totalTime : this.totalTime,
                added_ingredients: this.added_ingredients,
                raw_instructions: this.raw_instructions,
                sourceUrl: this.sourceUrl
            }
            this.$store.commit('updateCurrentRecipe', recipe)
        },
        getMeasureTextMapping() {
            let measureDict = {
                "tablespoon": "tbsp",
                "tablespoons": "tbsp",
                "tbsp": "tbsp",
                "teaspoon": "tsp",
                "teaspoons": "tsp",
                "tsp": "tsp",
                "litres": "l",
                "litre": "l",
                "liter": "l",
                "liters": "l",
                "l": "l",
                "grams": "g",
                "gram": "g",
                "g": "g",
                "ml": "ml",
                "cup": "cup",
                "kg": "kg"
            }
            return measureDict
        },
        replaceMeasuresInText(){
            let splitStrings = this.massIngredientsText.split(' ')
            let measureDict = this.getMeasureTextMapping()
            splitStrings.forEach(s => {
                if(measureDict[s]){
                    this.massIngredientsText = this.massIngredientsText.replace(s, measureDict[s])
                }
            })
        }
    }
}
</script>

<style scoped>

    .lightgray {
        background-color: #D1D5DE;
    }

    .lavendergray {
        background-color:	#B7B6C2;
    }

    #full-container {
        width: 100%;
    }

    .modal {
        overflow-x: hidden;
        overflow-y: auto;
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 9;
    }
    
    .backdrop {
            background-color: rgba(0, 0, 0, 0.3);
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 1;
        }

    .modal-dialog {
            background-color: #ffffff;
            position: relative;
            width: 600px;
            margin: 50px auto;
            display: flex;
            flex-direction: column;
            border-radius: 5px;
            z-index: 2;
            @media screen and (max-width: 992px) {
            width: 90%;
            }
        }
    .modal-close {
        width: 30px;
        height: 30px;
    }
    .modal-header {
        padding: 20px 20px 10px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
    }
    .modal-body {
        padding: 10px 20px 10px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s;
    }
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }

</style>