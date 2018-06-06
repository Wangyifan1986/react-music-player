import React, { Component } from 'react';
import Player from './page/player';
import Header from './components/header';
import MusicList from './page/musiclist';
import { MUSIC_LIST } from './config/musiclist';
//import { Router,  Link, Route, Switch } from 'react-router';
import {HashRouter, Route, Link, Switch} from 'react-router-dom'; 
import Pubsub from 'pubsub-js';
import { randomRange } from './utils/util';

class App extends React.Component{	
	
	 constructor(props) {
		super(props);
		this.state = {
			currentMusicItem: MUSIC_LIST[0],
			musicList: MUSIC_LIST,
			repeatType: 'cycle',
			isPlay: true
		};
		//this.progressChangeHandler = this.progressChangeHandler.bind(this);
	}

	play() {
		if(this.state.isPlay) {
			$("#player").jPlayer("pause");
		} else {
			$("#player").jPlayer("play");
		}

		this.setState({
			isPlay: !this.state.isPlay
		});
	}

	playMusic(musicItem) {
		$('#player').jPlayer('setMedia', {
			mp3: musicItem.file
		}).jPlayer('play');

		this.setState({
			currentMusicItem: musicItem,
			isPlay: true
		});
	}

	findMusicIndex(musicItem) {
		let index = this.state.musicList.indexOf(musicItem);

		return Math.max(0, index);
	}

	playNext(type='next') {
		let index = this.findMusicIndex(this.state.currentMusicItem);
		let listLength = this.state.musicList.length;

		if(type === 'next') {
			index = (index + 1) % listLength;
		} else {
			index = (index - 1 + listLength) % listLength;
		}

		let musicItem = this.state.musicList[index];

		this.playMusic(musicItem);

		console.log(this.state.isPlay);

		this.setState({
			currentMusicItem: musicItem,
			isPlay: true
		});
	}

	playWhenEnd() {

		console.log(this.state.repeatType);
		if(this.state.repeatType === 'random') {
			let index = this.findMusicIndex(this.state.currentMusicItem);
			let randomIndex = randomRange(0, this.state.musicList.length - 1);
			while(randomIndex === index) {
				randomIndex = randomRange(0, this.state.musicList.length - 1);
			}
			this.playMusic(this.state.musicList[randomIndex]);
		} else if (this.state.repeatType === 'once') {
			this.playMusic(this.state.currentMusicItem);
		} else {
			this.playNext();
		}
	}

	componentDidMount() {
		$('#player').jPlayer({
			supplied: 'mp3',
			wmode: 'window',
			useStateClassSkin: true
		});

		this.playMusic(this.state.currentMusicItem);

//		$('#player').bind($.jPlayer.event.ended, (e)=>{
//			this.playNext();
//		});
		
		$('#player').bind($.jPlayer.event.ended, (e)=>{
			this.playWhenEnd();
		});

		Pubsub.subscribe('PLAY', ()=>{
			this.play();
		});

		Pubsub.subscribe('PLAY_MUSIC', (msg, musicItem)=>{
			this.playMusic(musicItem);
		});

		Pubsub.subscribe('DEL_MUSIC', (msg, musicItem)=>{
			this.setState({
				musicList: this.state.musicList.filter((item)=>{
					return item !== musicItem;
				})
			});
		});	

		Pubsub.subscribe('PLAY_PREV', (msg, isPlay)=>{
			this.playNext('prev');
			//this.setState({
			//	isPlay: true 
			//});
		});

		Pubsub.subscribe('PLAY_NEXT', (msg, isPlay)=>{
			this.playNext();
		});

		let repeatList = ['cycle', 'once', 'random'];

		Pubsub.subscribe('CHANGE_REPEAT', ()=>{
			let index = repeatList.indexOf(this.state.repeatType);
			index = (index + 1) % repeatList.length;
			this.setState({
				repeatType: repeatList[index]
			});
		});
	}

	componentWillUnMount() {
		Pubsub.unsubscribe('PLAY');
		Pubsub.unsubscribe('PLAY_MUSIC');
		Pubsub.unsubscribe('DEL_MUSIC');
		Pubsub.unsubscribe('PLAY_PREV');
		Pubsub.unsubscribe('PLAY_NEXT');
		Pubsub.unsubscribe('CHANGE_REPEAT');
		$('#player').unbind($.jPlayer.event.ended);
	}

	render() {

		return (
			<div className="container">
				<Header></Header>
				<Player isPlay={this.state.isPlay} repeatType={this.state.repeatType} musicList={this.state.musicList} currentMusicItem={this.state.currentMusicItem}></Player>
				<MusicList musicList={this.state.musicList} currentMusicItem={this.state.currentMusicItem}></MusicList>
			</div>
		);
	}
}

class Root extends React.Component{
	render() {
		return (
			<HashRouter>
				<App>
					
				</App>
			</HashRouter>
		);
	}
}

export default Root;