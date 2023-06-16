import { async } from "regenerator-runtime";
import { MODAL_CLOSE_SECONDS } from "./config.js";
import * as model from "./model.js"
import recipeView from "./views/recipeView.js"
import searchView from "./views/searchView.js"
import resultsView from "./views/resultsView.js"
import paginationView from "./views/paginationView.js"
import bookmarksView from "./views/bookmarksView.js"
import addRecipeView from "./views/addRecipeView.js";


// import 'core-js/stable'
// import 'regenerator-runtime/runtime'

// if(module.hot){
//   module.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

// https://forkify-api.herokuapp.com/v2


const controlRecipes = async function(){
  try{
    const id=window.location.hash.slice(1)

    if(!id) return
    // loading recipe
    recipeView.renderSpinner()
    // loading recipe
    // 0 mark selected search result
    resultsView.update(model.getSearchResultsPage())

    // updating bookmarks
    bookmarksView.update(model.state.bookmarks)
    
    await model.loadRecipe(id);
    
    // rendering recipe 
    recipeView.render(model.state.recipe)
    // controlServings()
  }catch(err){
    console.log(err);
    recipeView.renderError()
  }
} 

const controlSearchResults= async function(){
  try{
    resultsView.renderSpinner()

    // 1 get search query
    const query = searchView.getQuery()
    
    if(!query) return
    // 2 load search
    await model.loadSearchResults(query);
    
    resultsView.render(model.getSearchResultsPage())
    
    paginationView.render(model.state.search);
  }catch(err){
    console.log(err)
  }
}
const controlPagination = function(goToPage){
  
  // 1 render new results
  resultsView.render(model.getSearchResultsPage(goToPage))
  // // 2 render new pagination buttons
  paginationView.render(model.state.search)
}

const controlServings = function(newServings){
  // Update the recipe servings (in state)
  model.updateServings(newServings)
  // update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function(){
  // add/remove bookmark
  if(!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id)

  // update bookmarks
  recipeView.update(model.state.recipe)

  bookmarksView.render(model.state.bookmarks)
  
}

const controlBookmarks =  function(){
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe){
  console.log(newRecipe);
  try{
    // show spinner
    addRecipeView.renderSpinner()
    // upload the new recipe data
   await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe);
    // render new recipe
    recipeView.render(model.state.recipe)
    // succes message
    addRecipeView.renderMessage()
    // render bookmarkView
    bookmarksView.render(model.state.bookmarks)
    // change id in url
    window.history.pushState(null,"",`#${model.state.recipe.id}`)
    // close form
    setTimeout(function(){
      addRecipeView._toggleWindow()
    },MODAL_CLOSE_SECONDS * 1000)

  }catch(err){
    console.error(err);
    addRecipeView.renderError(err.message)
  }
}


const init = function(){
  bookmarksView.addHandlerRender(controlBookmarks)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServing(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}
init()



// ["hashchange","load"].forEach(ev => 
//    window.addEventListener(ev,call)
// );
// window.addEventListener("hashchange",controlRecipes)
// window.addEventListener("load",controlRecipes)
///////////////////////////////////////
