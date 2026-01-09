const jokes = [
  {
    text: "Why do programmers prefer dark mode? Because light attracts bugs.",
    category: "programming",
    rating: 0
  },
  {
    text: "I told my computer I needed a break. It froze.",
    category: "programming",
    rating: 0
  },
  {
    text: "Debugging: Being the detective in a crime movie where you are also the murderer.",
    category: "programming",
    rating: 0
  },
  {
    text: "Why did the JavaScript developer go broke? Because they kept losing their cache.",
    category: "programming",
    rating: 0
  },
  {
    text: "Why do Java developers wear glasses? Because they don't C#.",
    category: "programming",
    rating: 0
  },
  {
    text: "I'm reading a book on anti-gravity. It's impossible to put down.",
    category: "puns",
    rating: 0
  },
  {
    text: "I used to be a baker, but I couldn't make enough dough.",
    category: "puns",
    rating: 0
  },
  {
    text: "What do you call a fake noodle? An impasta.",
    category: "puns",
    rating: 0
  },
  {
    text: "I'm on a seafood diet. I see food and I eat it.",
    category: "dad",
    rating: 0
  },
  {
    text: "Why don't skeletons fight each other? They don't have the guts.",
    category: "dad",
    rating: 0
  },
  {
    text: "What do you call a bear with no teeth? A gummy bear.",
    category: "dad",
    rating: 0
  },
  {
    text: "My code works. I have no idea why.",
    category: "programming",
    rating: 0
  },
  {
    text: "There are only 10 types of people in the world: those who understand binary and those who don't.",
    category: "programming",
    rating: 0
  },
  {
    text: "I changed my password to 'incorrect'. Now when I forget it, my computer reminds me.",
    category: "programming",
    rating: 0
  }
];

const jokeEl = document.getElementById("joke");
const btn = document.getElementById("jokeBtn");
const categorySelect = document.getElementById("categorySelect");
const currentCategoryEl = document.getElementById("currentCategory");
const ratingContainer = document.getElementById("ratingContainer");
const stars = document.querySelectorAll(".stars i");
const ratingText = document.getElementById("ratingText");
const favoriteBtn = document.getElementById("favoriteBtn");
const shareBtn = document.getElementById("shareBtn");
const viewFavoritesBtn = document.getElementById("viewFavoritesBtn");
const favoritesModal = document.getElementById("favoritesModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const favoritesList = document.getElementById("favoritesList");
const shareNotification = document.getElementById("shareNotification");

let currentJoke = null;
let currentJokeIndex = -1;
let favorites = JSON.parse(localStorage.getItem("jokeFavorites")) || [];
let ratings = JSON.parse(localStorage.getItem("jokeRatings")) || {};

function init() {
  loadRatings();
  displayRandomJoke();
  
  btn.addEventListener("click", displayRandomJoke);
  categorySelect.addEventListener("change", displayRandomJoke);
  favoriteBtn.addEventListener("click", toggleFavorite);
  shareBtn.addEventListener("click", shareJoke);
  viewFavoritesBtn.addEventListener("click", showFavorites);
  closeModalBtn.addEventListener("click", hideFavorites);
  
  stars.forEach(star => {
    star.addEventListener("click", () => rateJoke(star.dataset.rating));
  });
  
  window.addEventListener("click", (e) => {
    if (e.target === favoritesModal) {
      hideFavorites();
    }
  });
  
  updateFavoriteButton();
}

function displayRandomJoke() {
  const selectedCategory = categorySelect.value;
  let filteredJokes = selectedCategory === "all" 
    ? jokes 
    : jokes.filter(joke => joke.category === selectedCategory);
  
  if (filteredJokes.length === 0) {
    jokeEl.textContent = "No jokes found for this category. Try another one!";
    currentCategoryEl.textContent = "Category: None";
    currentJoke = null;
    currentJokeIndex = -1;
    updateRatingDisplay(0);
    return;
  }
  
  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * filteredJokes.length);
  } while (filteredJokes.length > 1 && randomIndex === currentJokeIndex);
  
  currentJokeIndex = randomIndex;
  currentJoke = filteredJokes[randomIndex];
  
  jokeEl.textContent = currentJoke.text;
  
  const categoryNames = {
    programming: "Programming",
    puns: "Puns",
    dad: "Dad Jokes",
    all: "All"
  };
  currentCategoryEl.textContent = `Category: ${categoryNames[currentJoke.category]}`;
  
  const jokeId = getJokeId(currentJoke.text);
  const rating = ratings[jokeId] || 0;
  updateRatingDisplay(rating);
  
  updateFavoriteButton();
}

function rateJoke(rating) {
  if (!currentJoke) return;
  
  const jokeId = getJokeId(currentJoke.text);
  ratings[jokeId] = parseInt(rating);
  localStorage.setItem("jokeRatings", JSON.stringify(ratings));
  
  updateRatingDisplay(rating);
  showNotification(`Rated ${rating} star${rating > 1 ? 's' : ''}!`);
}

function updateRatingDisplay(rating) {
  stars.forEach(star => {
    const starRating = parseInt(star.dataset.rating);
    if (starRating <= rating) {
      star.classList.remove("ri-star-line");
      star.classList.add("ri-star-fill", "active");
    } else {
      star.classList.remove("ri-star-fill", "active");
      star.classList.add("ri-star-line");
    }
  });
  
  if (rating > 0) {
    ratingText.textContent = `Rated ${rating} star${rating > 1 ? 's' : ''}`;
    ratingText.style.color = "#fbbf24";
  } else {
    ratingText.textContent = "Not rated yet";
    ratingText.style.color = "#94a3b8";
  }
}

function loadRatings() {
  const savedRatings = JSON.parse(localStorage.getItem("jokeRatings")) || {};
  ratings = savedRatings;
}

function toggleFavorite() {
  if (!currentJoke) return;
  
  const jokeId = getJokeId(currentJoke.text);
  const existingIndex = favorites.findIndex(fav => fav.id === jokeId);
  
  if (existingIndex >= 0) {
    favorites.splice(existingIndex, 1);
    showNotification("Removed from favorites");
  } else {
    favorites.push({
      id: jokeId,
      text: currentJoke.text,
      category: currentJoke.category
    });
    showNotification("Added to favorites!");
  }
  
  localStorage.setItem("jokeFavorites", JSON.stringify(favorites));
  
  updateFavoriteButton();
}

function updateFavoriteButton() {
  if (!currentJoke) {
    favoriteBtn.disabled = true;
    favoriteBtn.innerHTML = '<i class="ri-heart-line"></i> Add to Favorites';
    favoriteBtn.classList.remove("favorited");
    return;
  }
  
  const jokeId = getJokeId(currentJoke.text);
  const isFavorite = favorites.some(fav => fav.id === jokeId);
  
  if (isFavorite) {
    favoriteBtn.innerHTML = '<i class="ri-heart-fill"></i> Remove Favorite';
    favoriteBtn.classList.add("favorited");
  } else {
    favoriteBtn.innerHTML = '<i class="ri-heart-line"></i> Add to Favorites';
    favoriteBtn.classList.remove("favorited");
  }
  
  favoriteBtn.disabled = false;
}

function shareJoke() {
  if (!currentJoke) return;
  
  const jokeText = encodeURIComponent(currentJoke.text);
  const shareUrl = `${window.location.origin}${window.location.pathname}?joke=${jokeText}`;
  
  navigator.clipboard.writeText(shareUrl)
    .then(() => {
      showNotification("Joke link copied to clipboard!");
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
      const tempInput = document.createElement("input");
      tempInput.value = shareUrl;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      showNotification("Joke link copied to clipboard!");
    });
}

function showFavorites() {
  if (favorites.length === 0) {
    favoritesList.innerHTML = '<li style="text-align: center; color: #94a3b8;">No favorite jokes yet.</li>';
  } else {
    favoritesList.innerHTML = "";
    
    favorites.forEach((favorite, index) => {
      const li = document.createElement("li");
      
      const categoryNames = {
        programming: "Programming",
        puns: "Puns",
        dad: "Dad Jokes"
      };
      
      li.innerHTML = `
        <div class="favorite-joke-text">${favorite.text}</div>
        <div style="display: flex; align-items: center;">
          <span class="favorite-joke-category">${categoryNames[favorite.category] || favorite.category}</span>
          <button class="remove-favorite" data-index="${index}">
            <i class="ri-delete-bin-line"></i>
          </button>
        </div>
      `;
      
      favoritesList.appendChild(li);
    });
    
    document.querySelectorAll(".remove-favorite").forEach(button => {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(button.dataset.index);
        removeFavorite(index);
      });
    });
  }
  
  favoritesModal.style.display = "flex";
}

function hideFavorites() {
  favoritesModal.style.display = "none";
}

function removeFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem("jokeFavorites", JSON.stringify(favorites));
  
  updateFavoriteButton();
  showFavorites();
  showNotification("Removed from favorites");
}

function showNotification(message) {
  shareNotification.textContent = message;
  shareNotification.classList.add("show");
  
  setTimeout(() => {
    shareNotification.classList.remove("show");
  }, 2000);
}

function getJokeId(jokeText) {
  return jokeText.substring(0, 30).replace(/\s+/g, '-').toLowerCase();
}

function checkUrlForJoke() {
  const urlParams = new URLSearchParams(window.location.search);
  const jokeParam = urlParams.get('joke');
  
  if (jokeParam) {
    const decodedJoke = decodeURIComponent(jokeParam);
    
    const existingJoke = jokes.find(joke => joke.text === decodedJoke);
    
    if (existingJoke) {
      currentJoke = existingJoke;
      jokeEl.textContent = currentJoke.text;
      
      categorySelect.value = currentJoke.category;
      const categoryNames = {
        programming: "Programming",
        puns: "Puns",
        dad: "Dad Jokes"
      };
      currentCategoryEl.textContent = `Category: ${categoryNames[currentJoke.category]}`;
      
      const jokeId = getJokeId(currentJoke.text);
      const rating = ratings[jokeId] || 0;
      updateRatingDisplay(rating);
      
      updateFavoriteButton();
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  init();
  checkUrlForJoke();
});