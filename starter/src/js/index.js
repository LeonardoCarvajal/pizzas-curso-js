// Global app controller
// import str from './models/Search';
// //import {add as a, multiply as m, ID } from './views/searchView';
// import * as searchView from './views/searchView';

// console.log(`Using imported function! ${searchView.add(searchView.ID, 2)} and ${searchView.multiply(3, 5)}. ${str}`);

//////////////////////////////////////////////////////
// 74721b3119e90c8d00c3bcf97ece2bca
// https://www.food2fork.com/api/search
// https://www.food2fork.com/api/get 


import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

/* Global state of the app 
 - Search object
 - Currnet recipe object
 - Shopping list object
 - Liked recipes
*/

const state = {};

/**
 * SEARCH CONTROLLER
 */

const controlSearch = async () => {
    //1) Get query from view
    const query = searchView.getInput();

    if (query) {
        // 2) New search object and add to state
        state.search = new Search(query);

        // 3) Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try{
            // 4) Search for recipes
            await state.search.getResults();
    
            // 5)Render results on IU
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch (error) {
            alert('Something wrong with the search... :( ');
            console.log(error);
            clearLoader();
        }
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});


elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});

/**
 * RECIPE CONTROLLER
 */ 

 const controlRecipe = async () => {
     // Get ID from url
     
     const id = window.location.hash.replace('#', '');
     console.log(id);

     if (id) {
        // Prepare UI for chanmges
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // Highlight selected search item
        if (state.search) searchView.highlightSelected(id);

         //Create new recipe objetc
        state.recipe = new Recipe(id);

        try{
            // Get recipe data and parse ingredients
           await state.recipe.getRecipe();
            state.recipe.parseIngredients(); 
            // Calculate servings and time
           state.recipe.calcTime();
           state.recipe.calcServings();
    
            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);

            
        }catch (error) {
            alert('Error processing recipe!...')
            console.log(error);
        }

     }
 };

//  window.addEventListener('hashchange', controlRecipe);
//  window.addEventListener('load', controlRecipe);

 ['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

 // Handling recipe button clicks
 elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // Decrease button is clicked
        if(state.recipe.servings > 1 ){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
 });