<template>
<div>
  <b-container fluid>
    <!-- User Interface controls -->
    <b-row>
      <b-col lg="6" class="my-1">
        <b-form-group
          label="Sort"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="sortBySelect"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-select v-model="sortBy" id="sortBySelect" :options="sortOptions" class="w-75">
              <template v-slot:first>
                <option value="">-- none --</option>
              </template>
            </b-form-select>
            <b-form-select v-model="sortDesc" size="sm" :disabled="!sortBy" class="w-25">
              <option :value="false">Asc</option>
              <option :value="true">Desc</option>
            </b-form-select>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col lg="6" class="my-1">
        <b-form-group
          label="Filter"
          label-cols-sm="3"
          label-align-sm="right"
          label-size="sm"
          label-for="filterInput"
          class="mb-0"
        >
          <b-input-group size="sm">
            <b-form-input
              v-model="filter"
              type="search"
              id="filterInput"
              placeholder="Type to Search"
            ></b-form-input>
            <b-input-group-append>
              <b-button :disabled="!filter" @click="filter = ''">Clear</b-button>
            </b-input-group-append>
          </b-input-group>
        </b-form-group>
      </b-col>

      <b-col sm="5" md="6" class="my-1">
        <b-form-group
          label="Per page"
          label-cols-sm="6"
          label-cols-md="4"
          label-cols-lg="3"
          label-align-sm="right"
          label-size="sm"
          label-for="perPageSelect"
          class="mb-0"
        >
          <b-form-select
            v-model="perPage"
            id="perPageSelect"
            size="sm"
            :options="pageOptions"
          ></b-form-select>
        </b-form-group>
      </b-col>

      <b-col sm="7" md="6" class="my-1">
        <b-pagination
          v-model="currentPage"
          :total-rows="totalRows"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0"
        ></b-pagination>
      </b-col>
    </b-row>

    <b-alert variant="success" v-if="this.success" show>{{this.success}}</b-alert>
    <b-alert variant="danger" v-if="this.err" show>{{this.err}}</b-alert>
    <!-- Main table element -->
    <b-table
      show-empty
      small
      stacked="md"
      :items="items"
      :fields="fields"
      :current-page="currentPage"
      :per-page="perPage"
      :filter="filter"
      :filterIncludedFields="filterOn"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :sort-direction="sortDirection"
      :default-sort="['id', 'asc']"
      @filtered="onFiltered"
    >
      <template v-slot:cell(name)="row">
        {{ row.value }}
      </template>

      <template v-slot:cell(actions)="row">

        <b-button variant="warning" size="sm" @click="editIngredient(row.item)" class="mr-1">
          Edit
        </b-button>
        <b-button variant="outline-primary" size="sm" @click="row.toggleDetails">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-button>
      </template>

      <template v-slot:row-details="row">
        <b-card>
          <b-row align-v='center' justify='center'>
            <b-col cols="4">
              <b-img thumbnail fluid right style="max-height:300px" :src=row.item.img></b-img>
            </b-col>
            <b-col cols="4">
              <p class="text-left mx-10" v-html="showIngredientDetails(row.item).replace(/(?:\r\n|\r|\n)/g, '<br />')"></p>
            </b-col>
            <b-col cols=12>
                <b-button variant="danger" v-on:click="row.item.is_valid=false; handleSubmit(row.item)" v-show="row.item.is_valid">Invalidate Ingredient</b-button>
                <b-button variant="success" v-on:click="row.item.is_valid=true; handleSubmit(row.item)" v-show="!row.item.is_valid">Validate Ingredient</b-button>
            </b-col>
          </b-row>
        </b-card>
      </template>
    </b-table>
  </b-container>
</div>
</template>

<script>
import axios from 'axios'
import Vue from 'vue'
import { getSignedUrl, uploadImageFileToS3, uploadImageUrlToS3 } from '@/helpers/s3-image-storage'
import AddIngredientCore from '../Ingredient/AddIngredientCore.vue'


export default {
  data() {
    return {
      err : null,
      success : null,
      deploy_to : process.env.VUE_APP_DATABASE,
      items: [],
      show: false,
      uploadedImgEdit: null,
      ingredient: null,
      editedIngredient: null, //this.ingredient before submission
      categoriesAsOptions: [],
      categories: [],
      diets: [],
      selectedCategory: "",
      selectedDiets: [],
      fields: [
        { key: 'id', label: 'Ingredient Id', sortable: true, class: 'text-center' },
        { key: 'name', label: 'Name', sortable: true, class: 'text-center' },
        { key: 'category.name', label: 'Category', sortable: true, class: 'text-center' },
        { key: 'actions', label: 'Actions' }
      ],
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      pageOptions: [5, 10, 15],
      sortBy: 'id',
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      filterOn: []
    }
  },
  components: {
    AddIngredientCore
  },
  computed: {
    sortOptions() {
      // Create an options list from our fields
      return this.fields
        .filter(f => f.sortable)
        .map(f => {
          return { text: f.label, value: f.key }
        })
    }
  },
  mounted (){
      axios.get(this.deploy_to + 'backoffice/ingredients/',{headers: {
              'Authorization': `${this.$store.getters.getTokenToSend}`
          }})
          .then(response => {
              this.items = response.data
              this.totalRows = this.items.length
              })
          .catch(error => {
              this.showErr(error)
              console.log(error)
          }),
          axios.get(this.deploy_to + 'category/', {headers: {
              'Authorization': `Token ${this.$store.getters.getToken}`
          }}).then(resp => {
              this.categories = resp.data.results
              for(var i=0;i<this.categories.length;i++){
                this.categoriesAsOptions.push({"value":this.categories[i],"text":this.categories[i].name})
              }
          }).catch(errors => {
              this.showErr(errors)
              console.log(errors)
          }),
          axios.get(this.deploy_to + 'diet/', {headers: {
              'Authorization': `Token ${this.$store.getters.getToken}`
          }}).then(resp => {
              this.diets = resp.data.results
          }).catch(errors => {
              this.showErr(errors)
              console.log(errors)
          })
  },
  methods: {
      editIngredient(ingredient) {
        console.log(ingredient)
        this.$modal.show(
            AddIngredientCore,
            {initialName: ingredient.name, initialUrl: ingredient.img, initialCategory: ingredient.category, initialDiets: ingredient.diets, initialEditIngredientId: ingredient.id},
            { width: "500", height: "auto", adaptive: true, scrollable: true},
            { 'before-close': this.ingredientAdded }

        );
      },
      ingredientAdded(event){
        if(event && event.params.paramList){
          let ingredient = event.params.paramList[0]
          let requestId = event.params.paramList[1]
          console.log("Returned from ingredient added successfully - " + ingredient.name)
        }
      },
      showErr(msg){
          this.err = msg
          setTimeout(() => this.err = null, 3000);
      },
      showSuccess(msg){
          this.success = msg
          setTimeout(() => this.success = null, 3000);
      },
      showIngredientDetails(item){
        this.editedIngredient = item
        var details = "id:" + item.id + "\nname: " + item.name + "\ncategory: " + item.category.name + "\ndiets: " + item.diets.map(d => d.name) + "\nvalid: " + item.is_valid + "\ndeleted: " + item.is_deleted 
        return details
      },
      setCategory(){
        this.editedIngredient.category = this.selectedCategory
      }
      ,
      onFiltered(filteredItems) {
        this.totalRows = filteredItems.length
        this.currentPage = 1
      },
      async handleSubmit() {
        //todo add confirm modal before submit
        this.editedIngredient.diets = this.selectedDiets
        this.ingredient = this.editedIngredient

        if(this.editedIngredient.originalImg != this.editedIngredient.img){
          if(this.uploadedImgEdit){
            //Upload local img to S3
            let fileName = this.generateImageName(this.uploadedImgEdit, this.editedIngredient)
            this.editedIngredient.img = await uploadImageFileToS3(this.deploy_to, this.$store.getters.getToken, this.uploadedImgEdit, fileName)
          } else {
            //TODO Upload external img to S3 INSTEAD OF using external url
          }
        }
        axios.post(this.deploy_to + 'backoffice/edit/ingredient/'+this.ingredient.id+"/", this.editedIngredient, {headers: {
                'Authorization': `Token ${this.$store.getters.getToken}`}})
                    .then((response) => {
                        this.showSuccess("Success")
                        console.log(response);
                    })
                    .catch(errors => {
                        this.showErr(errors)
                        console.log(errors.status)
                    })
    },
    preview_edit_image(file){
          if(file){
              this.editedIngredient.img = URL.createObjectURL(file)
              this.uploadedImgEdit = file
          } else {
              this.editedIngredient.img = this.editedIngredient.originalImg
              this.uploadedImgEdit = null
          }
    },
    generateImageName(file, ingredient){
          const fileExtension = "." + file.name.split('.').pop();
          const randomInt = "_" + Math.floor(Math.random() * 10000)
          return ingredient.category.id + "_" + ingredient.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + randomInt + fileExtension
    },
  }
}
</script>