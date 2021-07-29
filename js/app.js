const API_URL = "https://fof-music-api.herokuapp.com";

let tracks = [];
let nextLink = null;
let previousLink = null;

async function makeAPIRequest(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`);
  const result = await response.json();
  return result;
}

async function searchTracks(query) {
  const result = await makeAPIRequest(`/search?q=${encodeURIComponent(query)}`);
  return result;
}

const tracklist = document.querySelector(".tracklist");
const trackTemplate = document.getElementById("track-template");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");

document.forms.search.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.forms.search.query;
  const result = await searchTracks(input.value);

  tracks = result.data;
  nextLink = result.next || null;
  previousLink = result.prev || null;

  render();
});

function render() {
  tracklist.replaceChildren();
  for (const track of tracks) {
    const trackWrapper = trackTemplate.content.cloneNode(true);

    const img = trackWrapper.querySelector(".track__image");
    img.src = track.album.cover;

    const titleWrapper = trackWrapper.querySelector(".track__title");
    titleWrapper.textContent = track.title;

    const artistWrapper = trackWrapper.querySelector(".track__artist");
    artistWrapper.textContent = track.artist.name;

    const audio = new Audio(track.preview);
    audio.preload = true;
    audio.volume = 0.1;
    trackWrapper.appendChild(audio);

    const playButton = trackWrapper.querySelector(".track__button");

    playButton.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        playButton.classList.remove("track__button--play");
        playButton.classList.add("track__button--pause");
      } else {
        audio.pause();
        playButton.classList.remove("track__button--pause");
        playButton.classList.add("track__button--play");
      }
    });

    tracklist.appendChild(trackWrapper);
  }

  nextButton.style.display = nextLink ? "block" : "none";
  prevButton.style.display = previousLink ? "block" : "none";
}

async function refreshTracks(url) {
  const result = await makeAPIRequest(url);

  tracks = result.data;
  nextLink = result.next || null;
  previousLink = result.prev || null;

  render();
}

nextButton.addEventListener("click", async () => {
  if (nextLink) {
    await refreshTracks(nextLink);
  }
});

prevButton.addEventListener("click", async () => {
  if (previousLink) {
    await refreshTracks(previousLink);
  }
});
