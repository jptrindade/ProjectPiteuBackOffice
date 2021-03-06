<template>
    <div class="container">
        <b-dropdown id="exportOption"
                  name="exportOption"
                  v-model="selected_option_to_export"
                  text="Select data to export"
                  variant="primary"
                  class="m-md-2"
                  :disabled=isExportButtonDisabled>
        <b-dropdown-item disabled value="0">Select an item</b-dropdown-item>
        <b-dropdown-item v-for="option in options_to_export" 
                            :key="option.value" 
                            :value="option.value"
                            @click="selected_option_to_export = option.value; exportData()">
            {{option.text}}
        </b-dropdown-item>           
        </b-dropdown> 
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: "ExportData",
    data (){
        return{
			deploy_to : process.env.VUE_APP_DATABASE,
            options_to_export : [{"text":"Recipes","value":"recipe"},{"text":"Ingredients","value":"ingredient"},{"text":"Diets","value":"diet"},{"text":"DishTypes","value":"dishType"},{"text":"Categories","value":"category"},{"text":"Measures","value":"measure"},{"text":"Users","value":"user"}],
            selected_option_to_export : null,
            isExportButtonDisabled : false
        }
    },
    methods: {
        exportData(){
            this.isExportButtonDisabled = true
            axios.get(this.deploy_to + 'exportdata/'+this.selected_option_to_export, {headers: {
				'Authorization': `${this.$store.getters.getTokenToSend}`
		}})
            .then(response => {
                this.forceFileDownload(response.data,this.selected_option_to_export+".json")
                this.isExportButtonDisabled = false
                
            })
            .catch(() => { console.log('error occured'+process.env.VUE_APP_DATABASE+'exportdata'); 
                this.isExportButtonDisabled = false })
        },
        forceFileDownload(data,fileName){
            var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify([data])))])
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
        },
    }
}
</script>

<style scoped>

</style>