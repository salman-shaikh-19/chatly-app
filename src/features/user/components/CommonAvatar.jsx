import userFallback from '../../../assets/images/fallback/userFallback.png'

const CommonAvatar=({avatar,avatarClassName=''})=>{

    return (
          <img
          src={avatar || userFallback}
             className={`select-none pointer-events-none object-cover rounded-full ${avatarClassName}`}
              onError={(e) => {
                             e.currentTarget.onerror = null; // prevents infinite loop
                             e.currentTarget.src = userFallback;
                         }}
           />
    )
}

export default CommonAvatar;
