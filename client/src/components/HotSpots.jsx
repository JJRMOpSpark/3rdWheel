import React, { useState, useEffect } from 'react';


import Image from 'react-bootstrap/Image';
import Axios from 'axios';
import Container from 'react-bootstrap/Container';
import Figure from 'react-bootstrap/Figure';
import FigureImage from 'react-bootstrap/FigureImage';



const HotSpots = (props) => {
  const [hotSpots, assignSpots] = useState([])
  let [recommendedRest, removeRest ] = useState([{
    name: 'Waffles on Maple',
    url: "https://www.yelp.com/biz/waffles-on-maple-new-orleans?adjust_creative=FC4b-r-lbieNLATYP2kmZg&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=FC4b-r-lbieNLATYP2kmZg",
    image_url: "https://s3-media1.fl.yelpcdn.com/bphoto/oKiHjcdFe3OhfNEG6EBw5w/o.jpg",
    location: {
      display_address: ["601 Frenchmen St", "New Orleans, LA 70116"]},
      distance: 6554
    }])
    
  let [restaurantType, setType] = useState(null);
  let [restChoices, setChoices] = useState([{title: 'Burgers', value: 'burgers'},
    { title: 'Hot Dogs', value: 'hotdog'},
    { title: 'Mexican', value:'mexican'},
    { title: 'Barbeque', value:'bbq'},
    { title: 'Cajun', value:'cajun'},
    { title: 'French', value:'french'},
    { title: 'Kosher', value:'kosher'},
    { title: 'Halal', value:'halal'},
    { title: 'Pizza', value:'pizza'},
    { title: 'Seafood', value:'seafood'}
  ]);
  let [restFilter, setFilter] = useState();

  function setRestaurant(input) {
    setType(restaurantType = input.target.value)
    const options = {
      method: 'get',
      url: '/restDecider',
      params: {
        restaurantFilter: restaurantType,
      }
    }
    Axios(options)
      .then((response) => {
        console.log('no error', response)
        removeRest(recommendedRest = response.data)
      })
      .catch((error) => {
        console.log('error'.errror)
      })
  }

  function removeChoice(){
    if(recommendedRest.length === 1){
      const oops = {
        name: 'No More Choices',
        url: "https://www.bustle.com/articles/146351-am-i-too-picky-in-dating-here-are-9-ways-to-tell",
        image_url: "http://giphygifs.s3.amazonaws.com/media/E87jjnSCANThe/giphy.gif",
        location: {
          display_address: ["123 Downda Street", "Who Knows, United States"]
        },
        distance: 14484060
      }
      removeRest(recommendedRest = [oops])
      console.log('naughty naughty')
    } else {
      removeRest(recommendedRest.slice(1))
      console.log(recommendedRest.length)
    }
  };
  
  useEffect(() => {
    async function fetch () {
      try {
        const result = await Axios.get('/hotspots');
        console.log(result);
        const spots = result.data;
        assignSpots(spots);
      } catch (err) {
        console.error(err);
      }
    }
    fetch();
  }, [])

  function reRoute(){
    document.location.replace(recommendedRest[0].url)
  }


  return (
    <Container>
      <h1>We help you decide!</h1>
      <h4>Select a type of restaurant below</h4>
      <select onChange={setRestaurant} className="select-css">
        {restChoices.map((choice) => {
          return (<option value={choice.value}>{choice.title}</option>)
          })}
        </select>
        <br></br>
      <button className="hotspot-button" type="button" onClick={reRoute}>Yes! See Website</button>
      <button className="hotspot-button" type="button" onClick={removeChoice}>YUCK! New Choice Please</button>
      <br></br>
      <Figure>
        <Figure.Caption>{recommendedRest[0].name}</Figure.Caption>
        <Figure.Caption>{recommendedRest[0].location.display_address[0]}</Figure.Caption>
        <Figure.Caption>{recommendedRest[0].location.display_address[1]}</Figure.Caption>
        <Figure.Caption> Only {Math.floor(recommendedRest[0].distance/1609)} miles away!</Figure.Caption>
        <Figure.Image
          width="432px"
          height="320px"
          src={recommendedRest[0].image_url}
        />
      </Figure>
      <br></br>
        <br></br>
        <br></br>
      <h3> Hot Spots </h3>
      <h4>Here are the most popular restaurants in your area</h4>

      {/* {
        hotSpots.map(locale => (
          <Figure>
            <Figure.Caption>
              {locale.name}
            </Figure.Caption>
            <Figure.Image 
            width="432px"
            height="320px"
            src={locale.image_url}
            alt="432x320"
            />
          </Figure>
        ))
      } */}
    </Container>
  );
}

export default HotSpots;