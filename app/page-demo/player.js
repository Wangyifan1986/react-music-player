import React from 'react';
import Progress from '../components/progress';
import { MUSIC_LIST } from '../config/musiclist';
import './player.less';
import { Link } from 'react-router';
import Pubsub from 'pubsub-js';

let duration = null;
class Player extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			progress: 0,
			volume: 0,
			leftTime: '',
			//isPlay: true,
			currentMusicItem: MUSIC_LIST[0],
			musicList: MUSIC_LIST
		};
	}

/*
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
*/
	play() {
		Pubsub.publish('PLAY'); 
	}

	playPrev(isPlay) {
		Pubsub.publish('PLAY_PREV', isPlay); 
	}

	playNext(isPlay) {
		Pubsub.publish('PLAY_NEXT', isPlay);
	}

	changeRepeat() {
		Pubsub.publish('CHANGE_REPEAT');
	}

	formatTime(time) {
		time = Math.floor(time);
		let minutes = Math.floor(time / 60);
		let seconds = Math.floor(time % 60);

		seconds = seconds < 10 ? `0${seconds}` : seconds;

		return `${minutes}:${seconds}`;
	}

	componentDidMount() {
		$('#player').bind($.jPlayer.event.timeupdate, (e)=>{
				duration = e.jPlayer.status.duration;
				this.setState({
					//progress: Math.round(e.jPlayer.status.currentTime)
					volume: e.jPlayer.options.volume * 100,
					progress:e.jPlayer.status.currentPercentAbsolute,
					leftTime: this.formatTime(duration * (1 - e.jPlayer.status.currentPercentAbsolute/100))
				});
		});
	}

	componentWillUnMount() {
		$('#player').unbind($.jPlayer.event.timeupdate);
	}

	changeProgressHandler(progress) {
		$('#player').jPlayer('play', duration * progress);
		this.setState({
			isPlay: true
		});
	}

	changeVolumeHandler(progress) {
		$('#player').jPlayer("volume", progress);
	}

	render() {
		return (
			<div>
				<div className="player-page">
					<h1 className="caption">我的私人音乐坊 </h1>
					<div className="mt20 row">
						<div className="control-wrapper">
							<h2 className="music-title">{this.props.currentMusicItem.title}</h2>	
							<h3 className="music-artist mt10">{this.props.currentMusicItem.artist}</h3>
							<div className="row mt20">
								<div className="left-time -col-auto">-{this.state.leftTime}</div>
								<div className="volume-container">
									<i className="icon-volume rt" style={{top: 5, left: -5}}></i>
									<div className="volume-wrapper">
										<Progress progress={this.state.volume} onProgressChange={(this.changeVolumeHandler).bind(this)} bgColor="#aaa"></Progress>
									</div>
								</div>
							</div>
							<div style={{height: 10, lineHeight: '10px', marginTop: 10}}>
								<Progress progress={this.state.progress} onProgressChange={(this.changeProgressHandler).bind(this)}></Progress>
							</div>
							<div className="mt35 row">
								<div>
									<i className="icon prev" onClick={(this.playPrev).bind(this)}></i>
									<i className={`icon ml20 ${this.props.isPlay ? 'pause' : 'play'}`} onClick={(this.play).bind(this)}></i>
									<i className="icon next ml20" onClick={(this.playNext).bind(this)}></i>
								</div>
								<div className="-col-auto">
									<i className={`icon repeat-${this.props.repeatType}`} onClick={(this.changeRepeat).bind(this)}></i>
								</div>
							</div>
						</div>
						<div className="-col-auto cover">
							<img src={this.props.currentMusicItem.cover} alt={this.props.currentMusicItem.title}/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Player;