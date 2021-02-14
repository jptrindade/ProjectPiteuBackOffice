<template>
    <v-container fill-height style="width:100%">
        <v-row justify="center" align="center">
        <v-col cols="12" :md="8">
            <AddIngredientCore/>
        </v-col>
        </v-row>
    </v-container>
</template>

<script>
import AddIngredientCore from '../Ingredient/AddIngredientCore.vue'


export default {
    name: "AddIngredientTab",
    components: {
        AddIngredientCore
    },
    data(){
        return {
            
        }
    },

    methods: {

    }

}
</script>

<style scoped>
</style>