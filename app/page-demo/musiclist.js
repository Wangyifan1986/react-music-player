import React from 'react';
import { MUSIC_LIST } from '../config/musiclist';
import MusicListItem from '../components/musiclistitem';

class MusicList extends React.Component{
	render() {
		let listEle = null;
		listEle = this.props.musicList.map((item)=>{
			return (
				<MusicListItem focus={item === this.props.currentMusicItem} key={item.id} musicItem={item}>
					{item.title}
				</MusicListItem>
			);
		});

		return (
			<ul>{ listEle }</ul>
		);
	}
}

export default MusicList;