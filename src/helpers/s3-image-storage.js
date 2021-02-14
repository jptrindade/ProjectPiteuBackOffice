import axios from 'axios'
import Vue from 'vue'

function getBucketUrl(){
	if(Vue.Constants.PRODUCTION_MODE == "true"){
		return Vue.Constants.S3_URL_PROD
	}
	return Vue.Constants.S3_URL_TEST
}

async function getSignedUrl(baseUrl, token, fileName){
	let productionModeFlag = Vue.Constants.PRODUCTION_MODE == "true" ? true : false

	return axios.post(baseUrl + 's3/signed-url/', {"fileName": fileName, "productionFlag": productionModeFlag}, {headers: {'Authorization': `Token ${token}`}})
				.then(resp => resp.data)
				.catch(errors => {
					console.log("Getting signed url Error: " + errors)
				})
}

async function uploadImageFileToS3(baseUrl, token, file, filename){
	const signedUrl = await getSignedUrl(baseUrl, token, filename)
	var bodyFormData = new FormData()
	Object.keys(signedUrl.fields).forEach(key => {
		bodyFormData.append(key, signedUrl.fields[key]);
	})
	bodyFormData.append('file', file, filename)
	
	//Remove default headers for S3 Communication
	var axiosForS3 = axios.create();
	delete axiosForS3.defaults.headers.common['Authorization'];
	delete axiosForS3.defaults.headers.common['Content-Type'];

	return axiosForS3.post(signedUrl.url, bodyFormData)
					.then(resp => getBucketUrl() + signedUrl.fields["key"])
					.catch(errors => {
						console.log("S3 ERROR: " + errors)
					})
}


export {
	getSignedUrl,
	uploadImageFileToS3
}
