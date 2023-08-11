import './App.css';

import Particles from 'react-particles-js';
import { Component } from 'react';

import Navigation from './Navigation/Navigation'
import Logo from './Logo/Logo'
import ImageLinkForm from './ImageLinkForm/ImageLinkForm'
import Rank from './Rank/Rank'
import ImageFaceRecognition from './ImageFaceRecognition/ImageFaceRecognition'
import Signin from './Signin/Signin'
import Register from './Register/Register'

const particlesOptions = {
  particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFacePosition = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)

    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({ box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    fetch('http://localhost:3000/imageurl', {
              method: 'post',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  input: this.state.input
              })
          })
    .then(response => response.json())
    .then(response => {
        if (response) {
          fetch('http://localhost:3000/image', {
              method: 'put',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id: this.state.user.id
              })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
        }
        this.displayFaceBox(this.calculateFacePosition(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    return (
    <div className="App">
      <Particles className='particles'
      params={particlesOptions}
      />
      <Navigation onRouteChange={this.onRouteChange} isSignedIn={this.state.isSignedIn} />
      { this.state.route === 'home' ? 
      <div>
        <Logo />
        <Rank userName={this.state.user.name} userEntries={this.state.user.entries}/>
        <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
        <ImageFaceRecognition box={this.state.box} imageUrl={this.state.imageUrl}/>
      </div> 
      : this.state.route === 'signin' ?
      <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> : 
      <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
      }
    </div>
    );
  }
}

export default App;
