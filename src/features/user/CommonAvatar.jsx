import userFallback from '../../../assets/images/fallback/userFallback.png'

const CommonAvatar=({avatar,avatarClassName=''})=>{

    return (
          <img
          src={avatar || userFallback}
             className={`object-cover w-12 h-12 rounded-full  ${avatarClassName}`}
              onError={(e) => {
                             e.currentTarget.onerror = null; // prevents infinite loop
                             e.currentTarget.src = userFallback;
                         }}
           />
    )
}

export default CommonAvatar;