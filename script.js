'use strict';

//FORM
const formCont = document.querySelector(".workoutInfoCont");
const form = document.querySelector(".workoutInfoAdd");
const typeInput = document.querySelector("#TypeInput");
const distanceInput = document.querySelector("#DistanceInput");
const durationInput = document.querySelector("#DurationInput");
const cadenceSlashElevation = document.querySelector("#CadenceOrElevationInput");
const cadenceOrElev = document.querySelector('#cadenceOrElev');
const interactiveMap = document.querySelector("#interactiveMap");

//SIDEBAR
const workoutsContainer = document.querySelector(".workoutsContainer");
distanceInput.placeholder = 'km';
durationInput.placeholder = 'min';
cadenceSlashElevation.placeholder = 'step/min';

//STORAGE?
const logoo = document.querySelector('.logoCont');

class Workout {
    months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    constructor (coords, distance, duration){
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
        this.date = new Date();
        this.id = (Date.now()).toString().slice(-10);
    }
}
class Running extends Workout {
    constructor (coords, distance, duration, cadence, type){
        super(coords, distance, duration);
        this.cadence = cadence;
        this.pace = Math.round(this.duration/this.distance);
        this.type = type;
    }
    _renderWorkout(){
        workoutsContainer.insertAdjacentHTML('beforeend', 
            `<div class="workoutInfoCont">
                <div class="workoutDecorRunning"></div>
                    <div class="workoutInfo" data-id="${this.id}">
                        <div>
                            <h1><span class="exerciseType">Running</span> on <span class="exerciseDate">${this.months[this.date.getMonth()]} ${this.date.getDate()}</span></h1>
                        </div>
                        <div class="exerciseDetails">
                        <span>🏃‍♀️${this.distance}  <span class="execBr">KM</span></span>
                        <span>⏲️${this.duration}  <span class="execBr">MINS</span></span>
                        <span>⚡${this.pace}  <span class="execBr">MIN/KM</span></span>
                        <span>😋${this.cadence}  <span class="execBr">STEPS/MIN</span></span>
                        </div>
                    </div>
            </div>
        `);
    }
}
class Cycling extends Workout {
    constructor (coords, distance, duration, elevation, type){
        super(coords, distance, duration);
        this.elevation = elevation;
        this.speed = Math.round((this.distance/this.duration)*60);
        this.type = type;
    }
    _renderWorkout(){
        workoutsContainer.insertAdjacentHTML('beforeend', 
            `<div class="workoutInfoCont">
                <div class="workoutDecorCycling"></div>
                    <div class="workoutInfo" data-id="${this.id}">
                        <div>
                            <h1><span class="exerciseType">Cycling</span> on <span class="exerciseDate">${this.months[this.date.getMonth()]} ${this.date.getDate()}</span></h1>
                        </div>
                        <div class="exerciseDetails">
                        <span>🚴${this.distance}  <span class="execBr">KM</span></span>
                        <span>⏲️${this.duration}  <span class="execBr">MINS</span></span>
                        <span>⚡${this.speed}  <span class="execBr">KM/H</span></span>
                        <span>⛰️${this.elevation}  <span class="execBr">M</span></span>
                        </div>
                    </div>
            </div>
        `);
    }
}

class App {
    #map
    #mapEvent //private properties
    _workouts = [];
    constructor() {
        this._getPosition(); //fires upon creation of the object, so based
        form.addEventListener('submit', this._newWorkout.bind(this));
        typeInput.addEventListener('change', this._placeholders.bind(this));
        workoutsContainer.addEventListener('click', this._centerOnWorkout.bind(this));
        this._getLocalStorage();
    }
    _getPosition(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this), 
                function(){
                    alert("position aquisition failed");
                }
            );
        }
    }
    _loadMap(position){
        const laTitude = position.coords.latitude;
        const loNgitude = position.coords.longitude;
        const cords = [laTitude, loNgitude];
        this.#map = L.map('interactiveMap').setView(cords, 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        this.#map.on('click', this._showForm.bind(this));
        

        //Horrible solution, absolutely asinine (fix l8r heres hoping), BUT WORKS :ddd
        this._workouts.forEach((wok)=>{ 
            let jujuonthatbeat = null;
            if(wok.type==='cycling'){
                jujuonthatbeat = new Cycling(wok.coords, wok.distance, wok.duration, wok.elevation, wok.type); 
            } else {
                jujuonthatbeat = new Running(wok.coords, wok.distance, wok.duration, wok.cadence, wok.type);
            }
            this._renderMarker(jujuonthatbeat);
        });
    }
    _showForm(mapE){
        formCont.classList.remove("hidden");
        this.#mapEvent = mapE;
    }
    //Check data validity
    _indexRemove(arr, indx){
        let newarr = [];
        let curIndx = 0;
        for(let elem of arr){
            if(curIndx!=indx){
                newarr.push(elem);
            }
            curIndx++;
        }
        return newarr;
    }
    _removeStartingZeroes(str){
        let restr = '';
        let zeroesOver = false;
        let isNegative=false;
        if(str[0]==='-'){
            isNegative=true;
            str = str.slice(1);
        }
        for (let char of str){
            if(char!='0'){
                zeroesOver=true;
            }
            if(zeroesOver){
                restr+=char;
            }
        }
        if(isNegative){
            return "-"+restr;
        } else {
            return restr;
        }
    }
    _formDataCheck(){
        let invalidInputs = false;
        let workingValues = [distanceInput.value, durationInput.value, cadenceSlashElevation.value];
        workingValues = workingValues.map(val => this._removeStartingZeroes(val));
        if(typeInput.value==='cycling'){
            if(!Number.isFinite(Number(workingValues[2]))){
                invalidInputs = true;
            }
            workingValues = this._indexRemove(workingValues, 2);
        }
        workingValues.forEach((elem)=>{
            if(!Number.isFinite(Number(elem))||Number(elem)<=0){
                invalidInputs=true;
            }
        });
        return invalidInputs;
    }
    _newWorkout(e){
        e.preventDefault();
        let workingValues = [distanceInput.value, durationInput.value, cadenceSlashElevation.value, typeInput.value];
        workingValues = workingValues.map(val => this._removeStartingZeroes(val));
        if(!this._formDataCheck()){
            if(workingValues[3].toLowerCase()==='cycling'){
                const biker = new Cycling([this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng], workingValues[0], workingValues[1], workingValues[2], workingValues[3]);
                biker._renderWorkout();
                this._workouts.push(biker);
                this._renderMarker(biker); 
            } else {
                const runboyrun = new Running([this.#mapEvent.latlng.lat, this.#mapEvent.latlng.lng], workingValues[0], workingValues[1], workingValues[2], workingValues[3]);
                runboyrun._renderWorkout();
                this._workouts.push(runboyrun);
                this._renderMarker(runboyrun);
            } 
        } else {
            alert("Input proper values.");
        }
        this._clearForm();
        this._setLocalStorage();   
    }
    _placeholders(){
        if(typeInput.value.toLowerCase()=='running'){
            distanceInput.placeholder = 'km';
            durationInput.placeholder = 'min';
            cadenceSlashElevation.placeholder = 'step/min';
            cadenceOrElev.textContent = 'Cadence'
        } else {
            distanceInput.placeholder = 'km';
            durationInput.placeholder = 'min';
            cadenceSlashElevation.placeholder = 'meters';
            cadenceOrElev.textContent = 'Elev Gain'
        }
    }
    _clearForm(){
        formCont.classList.add('hidden');
        distanceInput.value = '';
        durationInput.value = '';
        cadenceSlashElevation.value = '';
    }
    _renderMarker(workout){
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(
            L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: "workPopup"
            })
        )
        .setPopupContent(`${workout.type.charAt(0).toUpperCase()+workout.type.slice(1)} on ${workout.months[workout.date.getMonth()]} ${workout.date.getDate()}`)
        .openPopup();
    }
    _centerOnWorkout(e){
        const curWorkout = e.target.closest('.workoutInfo');
        let indks = 0;
        if (curWorkout){
            for(let workout of this._workouts){
                console.log(workout, 'owo')
                console.log(workout.id, curWorkout.dataset.id)
                if(workout.id===curWorkout.dataset.id){ 
                    break;
                }
                indks+=1;
            }
        console.log(indks)
        this.#map.setView(this._workouts[indks].coords, 12);
        }
    }
    _setLocalStorage(){
        localStorage.setItem('workouts', JSON.stringify(this._workouts));
    }
    _getLocalStorage(){
        const data = JSON.parse(localStorage.getItem('workouts'));
        console.log(data);
        if(!data){
            return;
        }
        this._workouts = data;
        let jujuonthatbeat;
        data.forEach(wok => {
            jujuonthatbeat = null;
            if(wok.type==='cycling'){
                jujuonthatbeat = new Cycling(wok.coords, wok.distance, wok.duration, wok.elevation, wok.type);
                jujuonthatbeat.id = wok.id; 
            } else {
                jujuonthatbeat = new Running(wok.coords, wok.distance, wok.duration, wok.cadence, wok.type);
                jujuonthatbeat.id = wok.id;
            }
            jujuonthatbeat._renderWorkout();
        });
    }
}


const app = new App();


//Temporary
logoo.addEventListener('click', function(){
    localStorage.clear();
});


