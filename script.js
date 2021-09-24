'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


class Workouts {
    date = new Date()
    id = (Date.now() + '').slice(-10)

    constructor(cords, distance, duration) {
        this.cords = cords // Array Lat and Lng
        this.distance = distance // in km
        this.duration = duration // in min
    }
}

class Running extends Workouts {
    type = 'running'
    constructor(cords, distance, duration, cadence) {
        super(cords, distance, duration)
        this.cadence = cadence
        this.calcPace()
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
    _mapEvent
    _workout = []

    constructor() { //The constructor is emediatly invoked when the children class is create.
        this._getPosition()

        form.addEventListener('submit', this._newWorkOut.bind(this)) // Em um event listener a variavel this sempre vai referenciar ao elemento dom que ele foi linkado, nesse caso ao form.
        // Podemos consertar isso devemos usar o bind().


        inputType.addEventListener('change', this._toggleElevationField())
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
    
            this._map = L.map('map').setView(cords, 17);
    
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
    this.renderWorkoutMarker(workout)
   
    // Render workout on list


    // Hide form + clear input fields


    // Clear input fields
    inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.value = ''

}

    renderWorkoutMarker(workout) {
        L.marker(workout.cords).addTo(this._map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`
        }))
        .openPopup().setPopupContent('Workout');
    }

 }


const app = new App