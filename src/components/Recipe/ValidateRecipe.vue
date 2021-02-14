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
      @filtered="onFiltered"
    >
      <template v-slot:cell(name)="row">
        {{ row.value }}
      </template>

      <template v-slot:cell(actions)="row">

        <b-button variant="warning" size="sm" @click="editRecipe(row.item.id)" class="mr-1">
          Edit
        </b-button>
        <b-button variant="outline-primary" size="sm" @click="showRecipeDetails(row)">
          {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
        </b-button>
      </template>

      <template v-slot:row-details="row">
        <b-card>
            <b-row align='center' justify="center">
            <b-col cols="4">
              <v-img contain align='right' :src=row.item.recipe.image></v-img>
            </b-col>
            <b-col cols="8">
              <p class="text-left mx-10" v-html="recipeToText(row.item).replace(/(?:\r\n|\r|\n)/g, '<br />')"></p>
            </b-col> 
            <b-col cols=12>
                <b-button variant="danger" v-on:click="row.item.recipe.is_valid=false; handleSubmit(row.item.recipe)" v-show="row.item.recipe.is_valid">Invalidate Recipe</b-button>
                <b-button variant="success" v-on:click="row.item.recipe.is_valid=true; handleSubmit(row.item.recipe)" v-show="!row.item.recipe.is_valid">Validate Recipe</b-button>
            </b-col>
          </b-row>
        </b-card>
      </template>
    </b-table>
    <!-- Info modal -->
  </b-container>
</div>
</template>

<script>

//todo update Recipe in table on submit (in ingredient it updates but here not ??)

import axios from 'axios'
  export default {
    data() {
      return {
        err : null,
        success : null,
        deploy_to : process.env.VUE_APP_DATABASE,
        items: [],
        show: false,
        recipe: null,
        fields: [
          { key: 'id', label: 'Recipe Id', sortable: true, class: 'text-center' },
          { key: 'name', label: 'Recipe Name', sortable: true, class: 'text-center'},
          { key: 'is_valid', label: 'Valid', sortable: true, class: 'text-center' },
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
        axios.get(this.deploy_to + 'backoffice/recipes/',{headers: {
                'Authorization': `${this.$store.getters.getTokenToSend}`
            }})
            .then(response => {
                this.items = response.data
                this.totalRows = this.items.length
                })
            .catch(error => {
            console.log(error)
            })
    },

    methods: {
      async getRecipe(id){
        return axios.get(this.deploy_to + `backoffice/recipe/${id}/`, {headers: {
            'Authorization': `Token ${this.$store.getters.getToken}`}})
                .then(resp => resp.data)
                .catch(errors => {
                    this.showErr(errors)
                    console.log(errors)
                })
      },
      showErr(msg){
          this.err = msg
          setTimeout(() => this.err = null, 3000);
      },
      showSuccess(msg){
          this.success = msg
          setTimeout(() => this.success = null, 3000);
      },
      onFiltered(filteredItems) {
        this.totalRows = filteredItems.length
        this.currentPage = 1
      },
      editRecipe(id){
        this.$store.commit('editRecipe', id)
        this.$router.push("/addRecipe")
      },
      handleSubmit() {
        //todo add confirm modal before submit
        axios.post(this.deploy_to + 'backoffice/edit/recipe/'+this.recipe.id+"/", this.recipe, {headers: {
                'Authorization': `Token ${this.$store.getters.getToken}`}})
                    .then((response) => {
                        this.showSuccess("status "+response.status)
                        console.log(response);
                    })
                    .catch(errors => {
                        this.showErr(errors)
                        console.log(errors)
                    })
      },
      async showRecipeDetails(row){
        this.recipe = await this.getRecipe(row.item.id)
        row.item["recipe"] = this.recipe
        row.toggleDetails()
      },
      recipeToText(item){
        const recipe = item.recipe
        console.log(recipe)
        return "<b>id:</b>" + recipe.id + "\n<b>name:</b> " + recipe.name + "\n<b>dish:</b> " + (recipe.dishType != null ? recipe.dishType.name : "null") + "\n<b>is_valid:</b> " + recipe.is_valid + "\n<b>readyIn:</b> " + recipe.readyInMinutes + "\n<b>prepareTime:</b> " + recipe.prepareInMinutes + "\n<b>description:</b> " + recipe.description + "\n<b>difficulty:</b> " + recipe.difficulty + "\n<b>serves:</b> " + recipe.serves + "\n<b>utensils:</b> " + recipe.utensils.map(u => u.name).join(', ') + "\n<b>ingredients:</b> " + recipe.ingredients.map(i => "" + i.quantity + " " + i.measureName + " " + i.ingredientName).join('; ') + "\n<b>steps:</b> " + recipe.instructions.length  
      }
    }
  }
</script>