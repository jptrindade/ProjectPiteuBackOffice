<template>
    <v-container fill-height align-center>
		<loading-overlay :active='isLoading' :is-full-page='true' :loader="'dots'"/>
		<v-row>
			<v-col md="12">
				<v-row justify="center">
					<v-col cols="8">
						<v-text-field v-model="recipeUrl" dense clearable single-line label="Recipe Url"></v-text-field>
					</v-col>
					<v-col cols="8">
						<p v-show="errorOnFetch" style="color:red"> {{errorOnFetch}} </p>
					</v-col>
				</v-row>
				<v-row justify="center">
					<v-col cols="3">
						<v-btn color="blue-grey" class="ma-2 white--text" @click="fetchRecipe">
							Fetch
							<v-icon right dark>mdi-cloud-download</v-icon>
							
						</v-btn>
					</v-col>
				</v-row>
			</v-col>
		</v-row>
    </v-container>
</template>

<script>
import axios from 'axios'
import Vue from 'vue'

export default {
    name: "FanarRecipe",
    components: {
		
    },
    data(){
        return {
			deploy_to : process.env.VUE_APP_DATABASE,
			recipeUrl : null,
			isLoading: false,
			errorOnFetch: null,
			recipe: this.initDefaultRecipe()
			
        }
    },
    mounted (){
    },
    methods: {
		fetchRecipe(){
			console.log("fetching")
			
			if(!this.recipeUrl)
				this.recipeUrl = "https://howtofeedaloon.com/amazing-mahi-mahi-tacos/"
			

			this.isLoading = true;

			axios.get(Vue.Constants.SCRAPER_URL, { params: { url: this.recipeUrl}})
			.then(response => {
				this.isLoading = false;
				this.recipe = response.data
				if(this.recipe){
					this.$store.commit('newExternalRecipe', this.recipe)
					this.$router.push("/addRecipe")
				}
			})
			.catch(error => {
				this.isLoading = false;
				if(error.response){
					this.handleErrorOnFetch(error.response.data.error)
				}
			})
		},
		handleErrorOnFetch(error){
			this.errorOnFetch = error
			this.recipeUrl = null
			setTimeout(function(){ this.errorOnFetch = null }.bind(this), 10000);
		},
		initDefaultRecipe(){
			return {
				"recipeName": "Tuscan Chicken in Creamy Sun Dried Tomato Sauce",
				"description": "Packed with flavour, my Tuscan Chicken in Creamy Sun Dried Tomato Sauce is the ultimate chicken dinner. Serve with pasta, potatoes or just a big hunk of bread to dip into that creamy sauce.",
				"allImageUrls": [
					"https://www.kitchensanctuary.com/wp-content/uploads/2020/04/Creamy-Tuscan-Chicken-100x150.png",
					"https://www.kitchensanctuary.com/wp-content/uploads/2020/04/Tuscan-Chicken-2-100x150.png",
					"https://www.kitchensanctuary.com/wp-content/uploads/2018/04/Tuscan-Chicken-creamy-sundried-tomato-sauce-recipe-pinterest-54x150.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2018/04/Tuscan-Chicken-Ingredients.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2018/04/Tuscan-Chicken-Process-1.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2018/04/Tuscan-Chicken-Process-2.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2018/04/Tuscan-Chicken-tall1-15.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2018/04/Tuscan-Chicken-square-FS-12-300x300.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2020/04/Chris-Nicky-Head-Shots-6-300x300.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2016/07/Cajun-Chicken-with-coriander-and-lime-rice-square-FS.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2015/08/Chicken-Satay-square-FS-7321-720x720.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2014/08/Cajun-Chicken-Noodle-Salad-with-Creamy-Chili-Lime-Dressing-Recipe-square-FS.jpg",
					"https://www.kitchensanctuary.com/wp-content/uploads/2018/02/Tuscan-Style-Stuffed-Mushrooms-in-Creamy-Sun-Dried-Tomato-Sauce-Recipe-square-FS.jpg"
				],
				"mainImageUrl": "https://www.kitchensanctuary.com/wp-content/uploads/2018/04/Tuscan-Chicken-square-FS-12-300x300.jpg",
				"dishType": "Dinner",
				"difficulty": null,
				"servings": "4",
				"totalTime": "40",
				"prepTime": "15",
				"instructions": {
					"1": "Preheat the oven to 160C/320F. Trim the chicken breasts to remove any fatty parts.",
					"2": "Whisk the egg lightly in a shallow bowl.",
					"3": "In a separate shallow bowl, mix together the flour, salt, pepper, oregano, thyme, paprika and garlic salt.",
					"4": "Heat 2 tbsp of the olive oil in a large frying pan (skillet) on a medium-to-high heat. Dip the chicken breasts in the egg, then dredge in the flour mixture.",
					"5": "Place the chicken in the pan and fry on both sides until golden.",
					"6": "Take the chicken out of the pan and place on a tray in the oven for 10 minutes to finish cooking whilst you make the sauce.",
					"7": "Add the remaining oil to the pan and heat on a medium heat.",
					"8": "Add the onion and cook for 3-4 minutes until they start to soften.",
					"9": "Add the garlic, oregano, paprika, sun dried tomatoes, red peppers and tomato puree. Cook for 2 minutes, moving around the pan with a spatula, then pour in the wine.",
					"10": "Allow to bubble for 2 minutes, then add the chicken stock, salt and pepper. Bring the boil, then simmer for 5 minutes.",
					"11": "Stir the cream and parmesan, then remove the chicken from the oven. Check it's done (insert a knife into the fattest piece of one of the chicken breasts - it should no longer be pink) and place in the pan.",
					"12": "Add the spinach to the sauce and stir to cover the spinach in the sauce. Cook for a further 3-4 minutes until the spinach wilts.",
					"13": "Serve topped with a sprinkling of fresh parsley. Tastes great with pasta, courgetti (zoodles), rice or saute potatoes."
				},
				"ingredients": {
					"ingredients": [
						{
							"quantity": 4,
							"measure": "",
							"name": "chicken breasts",
							"notes": ""
						},
						{
							"quantity": 1,
							"measure": "",
							"name": "large egg",
							"notes": ""
						},
						{
							"quantity": 3,
							"measure": "tbsp",
							"name": "plain",
							"notes": "all-purpose flour (replace with gluten free flour blend if needed)"
						},
						{
							"quantity": 0.25,
							"measure": "tsp",
							"name": "salt",
							"notes": ""
						},
						{
							"quantity": 0.5,
							"measure": "tsp",
							"name": "freshly ground black pepper",
							"notes": ""
						},
						{
							"quantity": 0.5,
							"measure": "tsp",
							"name": "dried oregano",
							"notes": ""
						},
						{
							"quantity": 0.5,
							"measure": "tsp",
							"name": "dried thyme",
							"notes": ""
						},
						{
							"quantity": 0.5,
							"measure": "tsp",
							"name": "dried paprika",
							"notes": ""
						},
						{
							"quantity": 0.25,
							"measure": "tsp",
							"name": "garlic salt",
							"notes": ""
						},
						{
							"quantity": 3,
							"measure": "tbsp",
							"name": "olive oil",
							"notes": ""
						},
						{
							"quantity": 1,
							"measure": "",
							"name": "brown onion ",
							"notes": "peeled and sliced"
						},
						{
							"quantity": 2,
							"measure": "cloves",
							"name": "garlic peeled and minced",
							"notes": ""
						},
						{
							"quantity": 0.5,
							"measure": "tsp",
							"name": "dried oregano",
							"notes": ""
						},
						{
							"quantity": 1,
							"measure": "tsp",
							"name": "paprika",
							"notes": ""
						},
						{
							"quantity": 1,
							"measure": "cup",
							"name": "(160g) sun dried tomatoes ",
							"notes": "I like the bright red one from the deli counter"
						},
						{
							"quantity": 1,
							"measure": "",
							"name": "red bell pepper ",
							"notes": "de-seeded and sliced"
						},
						{
							"quantity": 1,
							"measure": "tbsp",
							"name": "tomato puree",
							"notes": "(paste)"
						},
						{
							"quantity": 0.333,
							"measure": "cup",
							"name": "(90ml) white wine",
							"notes": ""
						},
						{
							"quantity": 1,
							"measure": "cup",
							"name": "(240ml) chicken stock",
							"notes": "(use bouillon for gluten free)"
						},
						{
							"quantity": "",
							"measure": "pinch",
							"name": "of salt and pepper",
							"notes": ""
						},
						{
							"quantity": 0.333,
							"measure": "cup",
							"name": "(90ml) double (heavy) cream",
							"notes": ""
						},
						{
							"quantity": 0.5,
							"measure": "packed cup",
							"name": "(50g) parmesan cheese ",
							"notes": "grated"
						},
						{
							"quantity": 3,
							"measure": "packed cups",
							"name": "(90g) fresh baby spinach",
							"notes": ""
						},
						{
							"quantity": 1,
							"measure": "tbsp",
							"name": "chopped parsley",
							"notes": ""
						}
					]
				}
			}
		}
    }
}
</script>

<style scoped>


</style>