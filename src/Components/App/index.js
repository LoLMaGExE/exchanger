import './style.css';

import axios from 'axios'
import { useEffect, useReducer, useRef, useState } from 'react';

import ExchangeForm from '../ExchangeForm'

// Bootstrap css
import 'bootstrap/dist/css/bootstrap.css';
import { Spinner } from 'react-bootstrap'

const staticAPI = [
  { "ccy": "USD", "base_ccy": "UAH", "buy": "8.40000", "sale": "8.228" },
  { "ccy": "EUR", "base_ccy": "UAH", "buy": "9.85000", "sale": "10.30303" },
  { "ccy": "RUR", "base_ccy": "UAH", "buy": "0.35000", "sale": "0.38000" },
  { "ccy": "BTC", "base_ccy": "UAH", "buy": "2.1403", "sale": "3.2077" }]

const App = ({
  isLoading = false,
  isError = false,
  isOffline = false,

  apiData = staticAPI }) => {

  // Сбираем обьект "начальное сотсояние"
  const initExchangeAppState = {
    isLoading,
    isError,
    isOffline,
    apiData
  }
  
  // Если состояние "offline" неактивно, то запрашываем данные с сервера
  // Использую ефект для вызова в начале
  useEffect(() => {
    if (!initExchangeAppState.isOffline)
      fetchExchangeData()
  }, [])

  // 
  const exchangeAppReducer = (state, action) => {
    switch (action.type) {
      // Запрос "инициализация" нам нужно точно знать когда мы уже подгрузили данные
      case "INIT": {
        // Обновляем состояне
        return {
          // Инициализируем начальные значения:
          // Возвразаем старое состояние
          ...state,
          // Состояне приложения загрузка - нужно для того, чтобы показать окно загрузки 
          isLoading: true
        }
      }
      // Запрос инициалиации 
      case "FETCH": {
        // Использую переменные (одна переменная заменяет длинную конструкцию + зрительно понятнее)
        let dataList = action.payload.apiDataList
        // Задаем состояние обьекта
        return {
          ...state,
          isLoading: false,
          apiData: dataList,
        }
      }
      case "ERROR": {
        // Запрос при ошибке
        // У нас ошибка (при отсутствии связи с АПИ)
        return {
          ...state,
          isError: true
        }
      }
    }
  }

  // Получаем данные с сервера
  const fetchExchangeData = async () => {
    // Запрос инициализации 
    dispatchExchangeApp({
      type: 'INIT'
    })
    // Получения данных с сервера, использую axios так как нраится
    axios.get('https://api.privatbank.ua/p24api/pubinfo?exchange&json&coursid=11')
      // Если есть ответ, то мы вызываем метод полусения нового состояния
      .then(res => dispatchExchangeApp({
        type: 'FETCH',
        payload: {
          apiDataList: res.data,
        }
      }))

      // Если сервер недоступен
      .catch(() => {
        dispatchExchangeApp({
          type: 'ERROR'
        })
      })
  }

  const [exchangeApp, dispatchExchangeApp] = useReducer(
    exchangeAppReducer,
    initExchangeAppState
  )

  if (exchangeApp.isError) {
    return (
      <>
        <h1>Something wrong...</h1>
        <h2>It can happen when you don`t have internet connection</h2>
      </>
    )
  }

  if (exchangeApp.isLoading) {
    return (
      <div className="exchange-form-loading">
        <Spinner animation="border" variant="primary" />
      </div>
    )
  }

  return (
    <div className="App">
      <ExchangeForm dataList={exchangeApp.apiData}></ExchangeForm>
    </div>
  );
}


export default App;
