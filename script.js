'use strict';

class Workouts {
    date = new Date()
    id = (Date.now() + '').slice(-10)
    click = 0

    constructor(cords, distance, duration) {
        this.cords = cords // Array Lat and Lng
        this.distance = distance // in km
        this.duration = duration // in min
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`
    }

    clicks() {
        this.click++
    }
}

class Running extends Workouts {
    type = 'running'
    constructor(cords, distance, duration, cadence) {
        super(cords, distance, duration)
        this.cadence = cadence
        this.calcPace()
        this._setDescription()
    }

    calcPace() {
        this.pace = this.duration / this.distance
        return this.pace
    }
}

class Cycling extends Workouts {
    type = 'cycling'
    constructor(cords, distance, duration, elevationGain) {
        super(cords, distance, duration)
        this.elevationGain = elevationGain
        this.calcSpeed()
        this._setDescription()
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60)
        return this.speed
    }

}

// App Architecture

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    _map
    _mapZoomLevel = 13
    _mapEvent
    _workout = []

    constructor() { //The constructor is emediatly invoked when the children class is create.
        this._getPosition()

        form.addEventListener('submit', this._newWorkOut.bind(this)) // Em um event listener a variavel this sempre vai referenciar ao elemento dom que ele foi linkado, nesse caso ao form.
        // Podemos consertar isso devemos usar o bind().

        inputType.addEventListener('change', this._toggleElevationField)

        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this))
    }
    
    _getPosition() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert('Could not get your position')
            })
        }
    }

    _loadMap(position) {
            console.log(position)
            const {latitude} = position.coords
            const {longitude} = position.coords
    
            const cords = [latitude, longitude]
            console.log(cords)
    
            this._map = L.map('map').setView(cords, this._mapZoomLevel);
    
            // console.log(this.#map)
    
            L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
            }).addTo(this._map);   
    
            // Handling click on map
            this._map.on('click', this._showForm.bind(this))
        }

    _showForm(mapE) {
            this._mapEvent = mapE // Assigning an event to a global variable.
            form.classList.remove('hidden')
            inputDistance.focus() // Select the form.
    }

    _hideForm() {
        // Empty inputs
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = ''
        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => {
            form.style.display = 'grid'
        }, 1000)
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }

    _newWorkOut(e) {

    e.preventDefault()

    //Helper Function
    const validInputs = (...inputs) => {
        return inputs.every(inp => Number.isFinite(inp))
    }

    const allPositive = (...inputs) => {
        return inputs.every((inp) => inp > 0)
    }
   
    // Get data from form.
    const type = inputType.value
    const distance = +inputDistance.value
    const duration = +inputDuration.value
    const cords = this._mapEvent.latlng
    let workout

    
    // If activity workout, create workout object.
    if(type === 'running') {
        const cadence = +inputCadence.value
        // Check if data is valid.
        if(!validInputs(distance, duration, cadence) || !allPositive(distance, duration)) { //(!Number.isFinite(distance) || (!Number.isFinite(duration) || !Number.isFinite(cadence))
            return alert('Inputs have to be positive Numbers!')
        }
        workout = new Running(cords, distance, duration, cadence)  
    }

    // If activity cycling, create cycling object.
    if(type === 'cycling') {
        const elevation = +inputElevation.value
        // Check if data is valid.
        if(!validInputs(distance, duration, elevation) || !allPositive(distance, duration, elevation)) { //(!Number.isFinite(distance) || (!Number.isFinite(duration) || !Number.isFinite(cadence))
            return alert('Inputs have to be positive Numbers!')
        }
        workout = new Cycling(cords, distance, duration, elevation)
    }

    // Add a new object to workout array.
    this._workout.push(workout)
    console.log(workout)

    // Render workout on map as a marker
    // const cords = this._mapEvent.latlng
    this._renderWorkoutMarker(workout)
   
    // Render workout on list
    this._renderWorkout(workout)

    // Hide form + clear input fields
    this._hideForm()

    // Clear input fields
    

}

    _renderWorkoutMarker(workout) {
        L.marker(workout.cords).addTo(this._map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`
        }))
        .openPopup().setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`);
    }

    _renderWorkout(workout) {
        let html = `<li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>`

        if(workout.type === 'running') {
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`
        } else {
            html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>`
        }

        form.insertAdjacentHTML('afterend', html)
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout')

        if(!workoutEl) return;

        const workout = this._workout.find(work => work.id === workoutEl.dataset.id)
        console.log(workout)

        this._map.setView(workout.cords, this._mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        })

        // Using the public interface
        workout.clicks()
    }
}

const app = new App