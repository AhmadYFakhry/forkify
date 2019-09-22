import axios from 'axios';
import {apiKey} from '../config'

export default class Search {
    constructor(query) {
        this.query = query;
        // this.resul
    }
    async getResults() {
        try {
            const data = await axios.get(`https://www.food2fork.com/api/search?key=${apiKey}&q=${this.query}`);
            console.log(data);
            this.result = data.data.recipes
        }
        catch(e) {
            alert(e);
        }
    }
}
