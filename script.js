'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position)
        const {latitude} = position.coords
        const {longitude} = position.coords
        console.log(latitude, longitude)
        console.log(`https://www.google.com.br/maps/@${latitude},${longitude}z`)

        const cords = [latitude, longitude]
        console.log(cords)

        const map = L.map('map').setView(cords, 17);

        console.log(map)

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);      

        map.on('click', (mapEvent) => {
            form.classList.remove('hidden')
            inputDistance.focus() // Select the form.
            

            const cords = mapEvent.latlng
            console.log(cords)

            L.marker(cords).addTo(map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: 'running-popup'
            }))
            .openPopup().setPopupContent('Workout');
        })

    }, function () {
        alert('Could not get your position')
    })
}

form.addEventListener('submit', () => {
    // Display marker
})