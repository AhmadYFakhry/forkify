import axios from 'axios';
import {apiKey} from '../config';
export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    async getRecipe() {
        try {
            const result = await axios.get(`https://www.food2fork.com/api/get?key=${apiKey}&rId=${this.id}`);
            console.log(result);
            this.title = result.data.recipe.title;
            this.author = result.data.recipe.publisher;
            this.image = result.data.recipe.image_url;
            this.url = result.data.recipe.source_url;
            this.ing = result.data.recipe.ingredients;

        }
        catch(e) {
            console.log(e);
            alert("Something went wrong");
        }
    }
    calcTime(recipe) {
        // Assuming we need 15 minutes per 3 ingredients
        const numOfIng = this.ing.length;
        this.time = Math.ceil((numOfIng/3) * 15)
    }
    calcServing() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'pound'];
        const newIng = this.ing.map(e => {
            // 1) Uniform units
            let ingredient = e.toLowerCase();
            unitsLong.forEach((unit, index) => {
                ingredient = ingredient.replace(unit, unitsShort[index])
            });
            // 2) Remove brackets
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');
            // 3) Parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2));

            let objIng;
            let count;
            if(unitIndex > -1) {
                // Exists
                const arrCount = arrIng.slice(0, unitIndex); // [4 1/2] cups
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex+1).join(' '),
                }
            } else if (parseInt(arrIng[0], 10)) {
                // There is no unit, but there is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit : '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            } else if (unitIndex === -1) {
                // No unit and no number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

            return objIng
        })
        this.ing = newIng;
    }

    updateServings(type) {
        //Servings
        const newServings = type === 'dec'? this.servings - 1 : this.servings + 1;
        //Ingredients
        this.ing.forEach(ingredient => {
            ingredient.count = ingredient.count * (newServings/this.servings);
        })
        this.servings = newServings;
        console.log(this.servings);
    }
}