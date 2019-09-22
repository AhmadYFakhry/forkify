import Search from './models/Search';
import * as searchView from './views/SearchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

import {elements, renderLoader, clearLoader} from './views/base';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';


// The Global state of the app
// Search object
// Current recipe object
// Shopping List Object
// Liked Recipes


const state = {};
/** 
 * SEARCH CONTROLLER */
const controlSearch = async () => {
    // get Query from view
    const query = searchView.getInput();
    if(query) {
        // New search object to query 
        state.search = new Search(query);
        // Prepare UI for result (clear input and results)
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.search);
        try {
            // get results from model
            await state.search.getResults();
            clearLoader();
            // Render results
            searchView.renderResults(state.search.result);
        } catch (error) {
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline')
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * TESTING LIKES
 */

 const controlRecipe = async () => {
     // Get ID from URL
     const id = window.location.hash.replace('#', '');
     // only executes if ID exists
     if(id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe)
        if(state.search) searchView.highlightedSelected(id)
        // Create new Recipe Object
        state.recipe = new Recipe(id);
        // Get Recipe Data
        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            // Calculate servings and time
            state.recipe.calcServing();
            state.recipe.calcTime();
            // Render recipe
            clearLoader();
            recipeView.renderRecipes(
                state.recipe,
                state.likes.isLiked(id));
        }
        catch(e) {
            console.log(e);
        }
     }
 }

 const controlList = () => {
    // Create list if it doesnt exist yet
    if(!state.list) state.list = new List();
    // Add the ingredients to the list
    state.recipe.ing.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
 }

 // Restore liked recipes

 window.addEventListener('load', () => {
     state.likes = new Likes();
     state.likes.readStorage();
     likesView.toggeLikeMenu(state.likes.getNumberOfLikes());
     state.likes.likes.forEach(like => likesView.renderLike(like));
 }); 

//Event listeners for haschange and load
['hashchange', 'load'].forEach(e => window.addEventListener(e, controlRecipe));

elements.recipe.addEventListener('click', e => {
    if(state.recipe.servings > 1) {
        if(e.target.matches('.btn-decrease, .btn-decrease *')) {
            // console.log("Up")
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe)
        }
        else if (e.target.matches('.btn-increase, .btn-increase *')) {
            // Increase button is clicked
            state.recipe.updateServings('inc');
            recipeView.updateServingsIngredients(state.recipe);
        } 
    } 
    if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    console.log("clicked");
        controlList();
    }
    if (e.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        console.log("in here")
        controlLike();
    }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id; 
    // console.log(currentID);
    console.log(state.recipe);
    if(!state.likes.isLiked(currentID)) {
        // Add it to the likes
        const newLike = state.likes.addLike(
            currentID, 
            state.recipe.title,
            state.recipe.author,
            state.recipe.image
            );
        // toggle the button
        likesView.toggleLikeBtn(true);

        // Add like to the list UI
        console.log(newLike);
        likesView.renderLike(newLike)

    } else {
        // Remove it from the likes
        state.likes.deleteLike(currentID);
        // toggle the button
        likesView.toggleLikeBtn(false);
        // remove like to the list
    }
    likesView.toggeLikeMenu(state.likes.getNumberOfLikes());
}



elements.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    // Handle delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);
        // Listview Delete
        listView.deleteItem(id);
    // handle the count update
    } else if (e.target.matches('.shopping__count--value')) {
        const val = parseFloat(e.target.value, 10);
        if (val > 0) state.list.updateCount(id, val);
    }
})


