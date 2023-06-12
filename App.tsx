import React, { useState, useEffect, Component, useRef } from 'react';
import * as Location from 'expo-location';
import MapView, { Marker, Callout, Geojson, Circle, Overlay, Polyline } from 'react-native-maps';
import { StyleSheet, ActivityIndicator, Modal, TouchableOpacity, Button, Alert, View, Text } from 'react-native';
import { Modalize } from 'react-native-modalize';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [location, setLocation] = useState({});
  const [maker, setMaker] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [map, setMap] = useState({});
  const [mapNumber, setMapNumber] = useState(0);

  const modal = React.createRef();

  const onClosed = () => {
    const modal = modal.current;
    if (modal) {
      modal.onClosed();
    }
  }

  const openModal = () => {
    const modal = modal.current;
    if (modal) {
      modal.open();
    }
  }

  const closeModal = () => {
    const modal = modal.current;
    if (modal) {
      modal.close();
    }
  }

  const currentPosition = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    let maker = {}
    maker.latitude = location.coords.latitude + Math.random() / 300 * Math.ceil(Math.random() * Math.ceil(Math.random() * 5)) * -2
    maker.longitude = location.coords.longitude - Math.random() / 300 * (Math.random() < 0.5 ? -2 : 2) * Math.ceil(Math.random() * Math.ceil(Math.random() * 5))

    setLocation(location.coords)
    setMaker(maker)
    setModalVisible(false)
  }

  const getDistance = (lat1, lng1, lat2, lng2) => {
    lat1 = lat1 || 0;
    lng1 = lng1 || 0;
    lat2 = lat2 || 0;
    lng2 = lng2 || 0;

    let rad1 = lat1 * Math.PI / 180.0;
    let rad2 = lat2 * Math.PI / 180.0;
    let a = rad1 - rad2;
    let b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    let r = 6378137;
    let distance = r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)));

    return distance;
  }

  const marker = async () => {
    let distance = getDistance(location.latitude, location.longitude, maker.latitude, maker.longitude)
    if (distance < 300) {
      Alert.alert(
        "Tips",
        `Success.`,
        [
          {
            text: "Confirm",
          }
        ]
      );
      setMapNumber(mapNumber + 2)
      setModalVisible(true)
      currentPosition()
    } else {
      Alert.alert(
        "Tips",
        `You have not yet arrived at the treasure location. Distance ${ distance.toFixed(2) }m.`,
        [
          {
            text: "Confirm",
          }
        ]
      );
    }
  }


  if (location.latitude) {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          showUserLocation={true}
          showsCompass={true}
          showsScale={true}
          showsTraffic={true}
          showsIndoors={true}
          loadingEnabled={true}
          pitchEnabled={true}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomEnabled={true}
          showsUserLocation={true}
          // followsUserLocation={true}
          userLocationCalloutEnabled={true}
          showsMyLocationButton={true}
          zoom={'20'}
        >
          <Geojson
            geojson={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'Point',
                    coordinates: [location.latitude, location.longitude],
                  }
                }
              ]
            }}
            strokeColor="blue"
            fillColor="green"
            strokeWidth={2}
          />
          {
            maker ? (
              <Marker onPress={() => marker()} coordinate={{latitude: maker.latitude, longitude: maker.longitude}} pinColor='red'>
                <Callout>
                  <Text>Treasure Point</Text>
                </Callout>
              </Marker>
            ) : <></>
          }
        </MapView>
        <Modal animationType="fade" visible={modalVisible} transparent={true}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems: 'center', justifyContent: 'center', }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text allowFontScaling={false} style={{ marginTop: 10, fontWeight: '600', color: '#FFF' }}>Map Loading ...</Text>
          </View>
        </Modal>
        <Modalize ref={modal} adjustToContentHeight={false} handlePosition="inside" alwaysOpen={160} modalHeight={200}>
          <View style={s.content}>
            <Text style={s.content__subheading}>{'Treasure Hunting'.toUpperCase()}</Text>
            <Text style={s.content__heading}>{ mapNumber || 0 }</Text>
            <TouchableOpacity underlayColor="transparent" style={s.content__reload} onPress={() => {
              setModalVisible(true)
              currentPosition()
            }}>
              <Ionicons name="reload-outline" size={20} color="#000" />
            </TouchableOpacity>

            <Text style={s.content__description}></Text>
          </View>
        </Modalize>
      </View>
    )
  } else {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', margin: 20 }}>
        <Text allowFontScaling={false} style={{ marginBottom: 20, fontSize: 20, fontWeight: '600' }}>Treasure Hunting</Text>
        <Text allowFontScaling={false} style={{ marginBottom: 350, fontSize: 16, textAlign: 'center' }}>Click Start to obtain the current location information.</Text>

        <Modal animationType="fade" visible={modalVisible} transparent={true}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', alignItems: 'center', justifyContent: 'center', }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text allowFontScaling={false} style={{ marginTop: 10, fontWeight: '600', color: '#FFF' }}>Map Loading ...</Text>
          </View>
        </Modal>
        
        <Button title="Click Start" onPress={() => {
          setModalVisible(true)
          currentPosition()
        }} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '90%',
  },
});


const s = StyleSheet.create({
  content: {
    padding: 20,
    position: 'relative'
  },

  content__modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
  },

  content__subheading: {
    marginBottom: 2,

    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
  },

  content__heading: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },

  content__reload: {
    position: 'absolute',
    top: 35,
    right: 20,
  },

  content__description: {
    paddingTop: 10,
    paddingBottom: 10,

    fontSize: 15,
    fontWeight: '200',
    lineHeight: 22,
    color: '#666',
  },
});
