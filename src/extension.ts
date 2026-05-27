import * as vscode from 'vscode';
import emojiRegex from 'emoji-regex';

type IconMapping = {
  importFrom: string;
  importName: string;
  jsx: string;
  label: string;
};

const EMOJI_MAP: Record<string, IconMapping> = {
  '🔥': { importFrom: 'fa6', importName: 'FaFire', jsx: '<FaFire />', label: 'fire' },
  '⭐': { importFrom: 'fa6', importName: 'FaStar', jsx: '<FaStar />', label: 'star' },
  '🌟': { importFrom: 'fa6', importName: 'FaStarHalfStroke', jsx: '<FaStarHalfStroke />', label: 'star-half' },
  '✅': { importFrom: 'fa6', importName: 'FaCircleCheck', jsx: '<FaCircleCheck />', label: 'check-circle' },
  '✔️': { importFrom: 'fa6', importName: 'FaCheck', jsx: '<FaCheck />', label: 'check' },
  '❌': { importFrom: 'fa6', importName: 'FaXmark', jsx: '<FaXmark />', label: 'close' },
  '🚀': { importFrom: 'fa6', importName: 'FaRocket', jsx: '<FaRocket />', label: 'rocket' },
  '💡': { importFrom: 'fa6', importName: 'FaLightbulb', jsx: '<FaLightbulb />', label: 'idea' },
  '⚠️': { importFrom: 'fa6', importName: 'FaTriangleExclamation', jsx: '<FaTriangleExclamation />', label: 'warning' },
  '🔍': { importFrom: 'fa6', importName: 'FaMagnifyingGlass', jsx: '<FaMagnifyingGlass />', label: 'search' },
  '🔎': { importFrom: 'fa6', importName: 'FaMagnifyingGlassPlus', jsx: '<FaMagnifyingGlassPlus />', label: 'search-plus' },
  '❤️': { importFrom: 'fa6', importName: 'FaHeart', jsx: '<FaHeart />', label: 'heart' },
  '💖': { importFrom: 'fa6', importName: 'FaHeartPulse', jsx: '<FaHeartPulse />', label: 'heart-pulse' },
  '💔': { importFrom: 'fa6', importName: 'FaHeartCrack', jsx: '<FaHeartCrack />', label: 'heart-crack' },
  '🎉': { importFrom: 'fa6', importName: 'FaPartyHorn', jsx: '<FaPartyHorn />', label: 'celebration' },
  '🎊': { importFrom: 'fa6', importName: 'FaGift', jsx: '<FaGift />', label: 'gift' },
  '🎈': { importFrom: 'fa6', importName: 'FaCircleDot', jsx: '<FaCircleDot />', label: 'balloon' },
  '📦': { importFrom: 'fa6', importName: 'FaBox', jsx: '<FaBox />', label: 'package' },
  '📁': { importFrom: 'fa6', importName: 'FaFolder', jsx: '<FaFolder />', label: 'folder' },
  '📂': { importFrom: 'fa6', importName: 'FaFolderOpen', jsx: '<FaFolderOpen />', label: 'folder-open' },
  '📄': { importFrom: 'fa6', importName: 'FaFileLines', jsx: '<FaFileLines />', label: 'file' },
  '📝': { importFrom: 'fa6', importName: 'FaPenToSquare', jsx: '<FaPenToSquare />', label: 'edit' },
  '📋': { importFrom: 'fa6', importName: 'FaClipboard', jsx: '<FaClipboard />', label: 'clipboard' },
  '📌': { importFrom: 'fa6', importName: 'FaThumbTack', jsx: '<FaThumbTack />', label: 'pin' },
  '📍': { importFrom: 'fa6', importName: 'FaLocationDot', jsx: '<FaLocationDot />', label: 'location' },
  '🛠️': { importFrom: 'fa6', importName: 'FaScrewdriverWrench', jsx: '<FaScrewdriverWrench />', label: 'tools' },
  '⚙️': { importFrom: 'fa6', importName: 'FaGear', jsx: '<FaGear />', label: 'settings' },
  '🔧': { importFrom: 'fa6', importName: 'FaWrench', jsx: '<FaWrench />', label: 'wrench' },
  '🔨': { importFrom: 'fa6', importName: 'FaHammer', jsx: '<FaHammer />', label: 'hammer' },
  '⚡': { importFrom: 'fa6', importName: 'FaBolt', jsx: '<FaBolt />', label: 'lightning' },
  '🧠': { importFrom: 'fa6', importName: 'FaBrain', jsx: '<FaBrain />', label: 'brain' },
  '📈': { importFrom: 'fa6', importName: 'FaArrowTrendUp', jsx: '<FaArrowTrendUp />', label: 'trend-up' },
  '📉': { importFrom: 'fa6', importName: 'FaArrowTrendDown', jsx: '<FaArrowTrendDown />', label: 'trend-down' },
  '📊': { importFrom: 'fa6', importName: 'FaChartBar', jsx: '<FaChartBar />', label: 'chart-bar' },
  '📐': { importFrom: 'fa6', importName: 'FaRuler', jsx: '<FaRuler />', label: 'ruler' },
  '🔒': { importFrom: 'fa6', importName: 'FaLock', jsx: '<FaLock />', label: 'lock' },
  '🔓': { importFrom: 'fa6', importName: 'FaLockOpen', jsx: '<FaLockOpen />', label: 'unlock' },
  '🔑': { importFrom: 'fa6', importName: 'FaKey', jsx: '<FaKey />', label: 'key' },
  '🛡️': { importFrom: 'fa6', importName: 'FaShield', jsx: '<FaShield />', label: 'shield' },
  '👤': { importFrom: 'fa6', importName: 'FaUser', jsx: '<FaUser />', label: 'user' },
  '👥': { importFrom: 'fa6', importName: 'FaUsers', jsx: '<FaUsers />', label: 'users' },
  '👑': { importFrom: 'fa6', importName: 'FaCrown', jsx: '<FaCrown />', label: 'crown' },
  '👍': { importFrom: 'fa6', importName: 'FaThumbsUp', jsx: '<FaThumbsUp />', label: 'thumbs-up' },
  '👎': { importFrom: 'fa6', importName: 'FaThumbsDown', jsx: '<FaThumbsDown />', label: 'thumbs-down' },
  '👋': { importFrom: 'fa6', importName: 'FaHandWave', jsx: '<FaHandWave />', label: 'wave' },
  '🤝': { importFrom: 'fa6', importName: 'FaHandshake', jsx: '<FaHandshake />', label: 'handshake' },
  '📧': { importFrom: 'fa6', importName: 'FaEnvelope', jsx: '<FaEnvelope />', label: 'email' },
  '📨': { importFrom: 'fa6', importName: 'FaEnvelopeOpen', jsx: '<FaEnvelopeOpen />', label: 'email-open' },
  '📞': { importFrom: 'fa6', importName: 'FaPhone', jsx: '<FaPhone />', label: 'phone' },
  '📱': { importFrom: 'fa6', importName: 'FaMobileScreen', jsx: '<FaMobileScreen />', label: 'mobile' },
  '💻': { importFrom: 'fa6', importName: 'FaLaptopCode', jsx: '<FaLaptopCode />', label: 'laptop-code' },
  '🖥️': { importFrom: 'fa6', importName: 'FaDesktop', jsx: '<FaDesktop />', label: 'desktop' },
  '🖨️': { importFrom: 'fa6', importName: 'FaPrint', jsx: '<FaPrint />', label: 'print' },
  '⌨️': { importFrom: 'fa6', importName: 'FaKeyboard', jsx: '<FaKeyboard />', label: 'keyboard' },
  '🖱️': { importFrom: 'fa6', importName: 'FaComputer', jsx: '<FaComputer />', label: 'mouse' },
  '🏠': { importFrom: 'fa6', importName: 'FaHouse', jsx: '<FaHouse />', label: 'home' },
  '🏢': { importFrom: 'fa6', importName: 'FaBuilding', jsx: '<FaBuilding />', label: 'building' },
  '🏪': { importFrom: 'fa6', importName: 'FaStore', jsx: '<FaStore />', label: 'store' },
  '🏆': { importFrom: 'fa6', importName: 'FaTrophy', jsx: '<FaTrophy />', label: 'trophy' },
  '🥇': { importFrom: 'fa6', importName: 'FaMedal', jsx: '<FaMedal />', label: 'medal' },
  '⏰': { importFrom: 'fa6', importName: 'FaClock', jsx: '<FaClock />', label: 'clock' },
  '📅': { importFrom: 'fa6', importName: 'FaCalendarDays', jsx: '<FaCalendarDays />', label: 'calendar' },
  '📆': { importFrom: 'fa6', importName: 'FaCalendarCheck', jsx: '<FaCalendarCheck />', label: 'calendar-check' },
  '⏱️': { importFrom: 'fa6', importName: 'FaStopwatch', jsx: '<FaStopwatch />', label: 'stopwatch' },
  '🗑️': { importFrom: 'fa6', importName: 'FaTrash', jsx: '<FaTrash />', label: 'trash' },
  '➕': { importFrom: 'fa6', importName: 'FaPlus', jsx: '<FaPlus />', label: 'plus' },
  '➖': { importFrom: 'fa6', importName: 'FaMinus', jsx: '<FaMinus />', label: 'minus' },
  '💬': { importFrom: 'fa6', importName: 'FaComment', jsx: '<FaComment />', label: 'comment' },
  '💭': { importFrom: 'fa6', importName: 'FaCommentDots', jsx: '<FaCommentDots />', label: 'comment-dots' },
  '🗨️': { importFrom: 'fa6', importName: 'FaComments', jsx: '<FaComments />', label: 'comments' },
  '🔗': { importFrom: 'fa6', importName: 'FaLink', jsx: '<FaLink />', label: 'link' },
  '🌐': { importFrom: 'fa6', importName: 'FaGlobe', jsx: '<FaGlobe />', label: 'globe' },
  '🌍': { importFrom: 'fa6', importName: 'FaEarthEurope', jsx: '<FaEarthEurope />', label: 'earth' },
  '🌎': { importFrom: 'fa6', importName: 'FaEarthAmericas', jsx: '<FaEarthAmericas />', label: 'earth-americas' },
  '☁️': { importFrom: 'fa6', importName: 'FaCloud', jsx: '<FaCloud />', label: 'cloud' },
  '⬆️': { importFrom: 'fa6', importName: 'FaArrowUp', jsx: '<FaArrowUp />', label: 'arrow-up' },
  '⬇️': { importFrom: 'fa6', importName: 'FaArrowDown', jsx: '<FaArrowDown />', label: 'arrow-down' },
  '⬅️': { importFrom: 'fa6', importName: 'FaArrowLeft', jsx: '<FaArrowLeft />', label: 'arrow-left' },
  '➡️': { importFrom: 'fa6', importName: 'FaArrowRight', jsx: '<FaArrowRight />', label: 'arrow-right' },
  '↩️': { importFrom: 'fa6', importName: 'FaRotateLeft', jsx: '<FaRotateLeft />', label: 'undo' },
  '↪️': { importFrom: 'fa6', importName: 'FaRotateRight', jsx: '<FaRotateRight />', label: 'redo' },
  '🔄': { importFrom: 'fa6', importName: 'FaArrowsRotate', jsx: '<FaArrowsRotate />', label: 'refresh' },
  '♻️': { importFrom: 'fa6', importName: 'FaRecycle', jsx: '<FaRecycle />', label: 'recycle' },
  '🎨': { importFrom: 'fa6', importName: 'FaPaintbrush', jsx: '<FaPaintbrush />', label: 'paintbrush' },
  '🖌️': { importFrom: 'fa6', importName: 'FaPalette', jsx: '<FaPalette />', label: 'palette' },
  '✏️': { importFrom: 'fa6', importName: 'FaPencil', jsx: '<FaPencil />', label: 'pencil' },
  '🧹': { importFrom: 'fa6', importName: 'FaBroom', jsx: '<FaBroom />', label: 'broom' },
  '🧪': { importFrom: 'fa6', importName: 'FaFlask', jsx: '<FaFlask />', label: 'flask' },
  '🧬': { importFrom: 'fa6', importName: 'FaDna', jsx: '<FaDna />', label: 'dna' },
  '🔬': { importFrom: 'fa6', importName: 'FaMicroscope', jsx: '<FaMicroscope />', label: 'microscope' },
  '🤖': { importFrom: 'fa6', importName: 'FaRobot', jsx: '<FaRobot />', label: 'robot' },
  '🐛': { importFrom: 'fa6', importName: 'FaBug', jsx: '<FaBug />', label: 'bug' },
  '🐙': { importFrom: 'di', importName: 'DiGithubBadge', jsx: '<DiGithubBadge />', label: 'github' },
  '💾': { importFrom: 'fa6', importName: 'FaFloppyDisk', jsx: '<FaFloppyDisk />', label: 'save' },
  '💿': { importFrom: 'fa6', importName: 'FaCompactDisc', jsx: '<FaCompactDisc />', label: 'disc' },
  '🎵': { importFrom: 'fa6', importName: 'FaMusic', jsx: '<FaMusic />', label: 'music' },
  '🎶': { importFrom: 'fa6', importName: 'FaHeadphones', jsx: '<FaHeadphones />', label: 'headphones' },
  '🔔': { importFrom: 'fa6', importName: 'FaBell', jsx: '<FaBell />', label: 'bell' },
  '🔕': { importFrom: 'fa6', importName: 'FaBellSlash', jsx: '<FaBellSlash />', label: 'bell-slash' },
  '📢': { importFrom: 'fa6', importName: 'FaBullhorn', jsx: '<FaBullhorn />', label: 'bullhorn' },
  '🏷️': { importFrom: 'fa6', importName: 'FaTag', jsx: '<FaTag />', label: 'tag' },
  '🏷': { importFrom: 'fa6', importName: 'FaTags', jsx: '<FaTags />', label: 'tags' },
  '🛒': { importFrom: 'fa6', importName: 'FaCartShopping', jsx: '<FaCartShopping />', label: 'cart' },
  '💳': { importFrom: 'fa6', importName: 'FaCreditCard', jsx: '<FaCreditCard />', label: 'credit-card' },
  '💰': { importFrom: 'fa6', importName: 'FaMoneyBill', jsx: '<FaMoneyBill />', label: 'money' },
  '💸': { importFrom: 'fa6', importName: 'FaMoneyBillWave', jsx: '<FaMoneyBillWave />', label: 'money-wave' },
  '🎯': { importFrom: 'fa6', importName: 'FaBullseye', jsx: '<FaBullseye />', label: 'target' },
  '🎮': { importFrom: 'fa6', importName: 'FaGamepad', jsx: '<FaGamepad />', label: 'gamepad' },
  '🕹️': { importFrom: 'fa6', importName: 'FaJoystick', jsx: '<FaJoystick />', label: 'joystick' },
  '🌙': { importFrom: 'fa6', importName: 'FaMoon', jsx: '<FaMoon />', label: 'moon' },
  '☀️': { importFrom: 'fa6', importName: 'FaSun', jsx: '<FaSun />', label: 'sun' },
  '❄️': { importFrom: 'fa6', importName: 'FaSnowflake', jsx: '<FaSnowflake />', label: 'snowflake' },
  '🌈': { importFrom: 'fa6', importName: 'FaCloudSun', jsx: '<FaCloudSun />', label: 'rainbow' },
  '📡': { importFrom: 'fa6', importName: 'FaSatelliteDish', jsx: '<FaSatelliteDish />', label: 'satellite' },
  '🛰️': { importFrom: 'fa6', importName: 'FaSatellite', jsx: '<FaSatellite />', label: 'satellite-orbit' },
  '🔭': { importFrom: 'fa6', importName: 'FaEye', jsx: '<FaEye />', label: 'eye-telescope' },
  '👁️': { importFrom: 'fa6', importName: 'FaEye', jsx: '<FaEye />', label: 'eye' },
  '🙈': { importFrom: 'fa6', importName: 'FaEyeSlash', jsx: '<FaEyeSlash />', label: 'eye-slash' },
  '📷': { importFrom: 'fa6', importName: 'FaCamera', jsx: '<FaCamera />', label: 'camera' },
  '📸': { importFrom: 'fa6', importName: 'FaCameraRetro', jsx: '<FaCameraRetro />', label: 'camera-retro' },
  '🎥': { importFrom: 'fa6', importName: 'FaVideo', jsx: '<FaVideo />', label: 'video' },
  '📺': { importFrom: 'fa6', importName: 'FaTv', jsx: '<FaTv />', label: 'tv' },
  '🗺️': { importFrom: 'fa6', importName: 'FaMap', jsx: '<FaMap />', label: 'map' },
  '🗓️': { importFrom: 'fa6', importName: 'FaCalendar', jsx: '<FaCalendar />', label: 'calendar-alt' },
  '🚗': { importFrom: 'fa6', importName: 'FaCar', jsx: '<FaCar />', label: 'car' },
  '✈️': { importFrom: 'fa6', importName: 'FaPlane', jsx: '<FaPlane />', label: 'plane' },
  '🚢': { importFrom: 'fa6', importName: 'FaShip', jsx: '<FaShip />', label: 'ship' },
  '🚂': { importFrom: 'fa6', importName: 'FaTrain', jsx: '<FaTrain />', label: 'train' },
  '🍕': { importFrom: 'fa6', importName: 'FaPizzaSlice', jsx: '<FaPizzaSlice />', label: 'pizza' },
  '☕': { importFrom: 'fa6', importName: 'FaMugHot', jsx: '<FaMugHot />', label: 'coffee' },
  '🍺': { importFrom: 'fa6', importName: 'FaBeerMugEmpty', jsx: '<FaBeerMugEmpty />', label: 'beer' },
  '📚': { importFrom: 'fa6', importName: 'FaBookOpen', jsx: '<FaBookOpen />', label: 'books' },
  '📖': { importFrom: 'fa6', importName: 'FaBook', jsx: '<FaBook />', label: 'book' },
  '🏋️': { importFrom: 'fa6', importName: 'FaDumbbell', jsx: '<FaDumbbell />', label: 'dumbbell' },
  '⚽': { importFrom: 'fa6', importName: 'FaFutbol', jsx: '<FaFutbol />', label: 'football' },
  '🏀': { importFrom: 'fa6', importName: 'FaBasketball', jsx: '<FaBasketball />', label: 'basketball' },
  'ℹ️': { importFrom: 'fa6', importName: 'FaCircleInfo', jsx: '<FaCircleInfo />', label: 'info' },
  '❓': { importFrom: 'fa6', importName: 'FaCircleQuestion', jsx: '<FaCircleQuestion />', label: 'question' },
  '‼️': { importFrom: 'fa6', importName: 'FaCircleExclamation', jsx: '<FaCircleExclamation />', label: 'exclamation' },
  '🔀': { importFrom: 'fa6', importName: 'FaShuffle', jsx: '<FaShuffle />', label: 'shuffle' },
  '⏭️': { importFrom: 'fa6', importName: 'FaForwardFast', jsx: '<FaForwardFast />', label: 'fast-forward' },
  '⏮️': { importFrom: 'fa6', importName: 'FaBackwardFast', jsx: '<FaBackwardFast />', label: 'fast-backward' },
  '▶️': { importFrom: 'fa6', importName: 'FaPlay', jsx: '<FaPlay />', label: 'play' },
  '⏸️': { importFrom: 'fa6', importName: 'FaPause', jsx: '<FaPause />', label: 'pause' },
  '⏹️': { importFrom: 'fa6', importName: 'FaStop', jsx: '<FaStop />', label: 'stop' },
  '🔁': { importFrom: 'fa6', importName: 'FaRepeat', jsx: '<FaRepeat />', label: 'repeat' },
  '💎': { importFrom: 'fa6', importName: 'FaGem', jsx: '<FaGem />', label: 'gem' },
  '🪄': { importFrom: 'fa6', importName: 'FaWandMagicSparkles', jsx: '<FaWandMagicSparkles />', label: 'magic' },
  '🎓': { importFrom: 'fa6', importName: 'FaGraduationCap', jsx: '<FaGraduationCap />', label: 'graduation' },
  '🏗️': { importFrom: 'fa6', importName: 'FaPersonDigging', jsx: '<FaPersonDigging />', label: 'construction' },
  '🧩': { importFrom: 'fa6', importName: 'FaPuzzlePiece', jsx: '<FaPuzzlePiece />', label: 'puzzle' },
  '🔢': { importFrom: 'fa6', importName: 'FaHashtag', jsx: '<FaHashtag />', label: 'hashtag' },
  '🔤': { importFrom: 'fa6', importName: 'FaFont', jsx: '<FaFont />', label: 'font' },
  '🚦': { importFrom: 'fa6', importName: 'FaTrafficLight', jsx: '<FaTrafficLight />', label: 'traffic-light' },
  '🚧': { importFrom: 'fa6', importName: 'FaRoadBarrier', jsx: '<FaRoadBarrier />', label: 'barrier' },
  '🌱': { importFrom: 'fa6', importName: 'FaSeedling', jsx: '<FaSeedling />', label: 'seedling' },
  '🌲': { importFrom: 'fa6', importName: 'FaTree', jsx: '<FaTree />', label: 'tree' },
  '🦁': { importFrom: 'fa6', importName: 'FaDragon', jsx: '<FaDragon />', label: 'lion' },
  '💪': { importFrom: 'fa6', importName: 'FaDumbbell', jsx: '<FaDumbbell />', label: 'strong' },
  '🤔': { importFrom: 'fa6', importName: 'FaFaceThinking', jsx: '<FaFaceThinking />', label: 'thinking' },
  '😊': { importFrom: 'fa6', importName: 'FaFaceSmile', jsx: '<FaFaceSmile />', label: 'smile' },
  '😎': { importFrom: 'fa6', importName: 'FaFaceGrinSquintTears', jsx: '<FaFaceGrinSquintTears />', label: 'cool' },
  '😢': { importFrom: 'fa6', importName: 'FaFaceSadTear', jsx: '<FaFaceSadTear />', label: 'sad' },
  '😡': { importFrom: 'fa6', importName: 'FaFaceAngry', jsx: '<FaFaceAngry />', label: 'angry' },
  '🤯': { importFrom: 'fa6', importName: 'FaFaceExplode', jsx: '<FaFaceExplode />', label: 'mind-blown' },
  '🚨': { importFrom: 'fa6', importName: 'FaSiren', jsx: '<FaSiren />', label: 'siren' },
  '🏴': { importFrom: 'fa6', importName: 'FaFlag', jsx: '<FaFlag />', label: 'flag' },
  '🚩': { importFrom: 'fa6', importName: 'FaFlagCheckered', jsx: '<FaFlagCheckered />', label: 'flag-checkered' },
  '🥧': { importFrom: 'fa6', importName: 'FaChartPie', jsx: '<FaChartPie />', label: 'chart-pie' },
  '🧮': { importFrom: 'fa6', importName: 'FaCalculator', jsx: '<FaCalculator />', label: 'calculator' },
  '📻': { importFrom: 'fa6', importName: 'FaRadio', jsx: '<FaRadio />', label: 'radio' },
  '🖊️': { importFrom: 'fa6', importName: 'FaPen', jsx: '<FaPen />', label: 'pen' },
  '🗒️': { importFrom: 'fa6', importName: 'FaNoteSticky', jsx: '<FaNoteSticky />', label: 'sticky-note' },
  '🗃️': { importFrom: 'fa6', importName: 'FaBoxArchive', jsx: '<FaBoxArchive />', label: 'archive' },
  '📤': { importFrom: 'fa6', importName: 'FaUpload', jsx: '<FaUpload />', label: 'upload' },
  '📥': { importFrom: 'fa6', importName: 'FaDownload', jsx: '<FaDownload />', label: 'download' },
  '🔃': { importFrom: 'fa6', importName: 'FaArrowsUpDown', jsx: '<FaArrowsUpDown />', label: 'sort' },
  '🔌': { importFrom: 'fa6', importName: 'FaPlug', jsx: '<FaPlug />', label: 'plug' },
  '🔋': { importFrom: 'fa6', importName: 'FaBatteryFull', jsx: '<FaBatteryFull />', label: 'battery' },
  '📶': { importFrom: 'fa6', importName: 'FaSignal', jsx: '<FaSignal />', label: 'signal' },
  '🛜': { importFrom: 'fa6', importName: 'FaWifi', jsx: '<FaWifi />', label: 'wifi' },
  '📲': { importFrom: 'fa6', importName: 'FaMobileScreenButton', jsx: '<FaMobileScreenButton />', label: 'mobile-notification' },
  '🖇️': { importFrom: 'fa6', importName: 'FaPaperclip', jsx: '<FaPaperclip />', label: 'paperclip' },
  '✂️': { importFrom: 'fa6', importName: 'FaScissors', jsx: '<FaScissors />', label: 'scissors' },
  '🪣': { importFrom: 'fa6', importName: 'FaBucket', jsx: '<FaBucket />', label: 'bucket' },
  '💊': { importFrom: 'fa6', importName: 'FaPills', jsx: '<FaPills />', label: 'pills' },
  '🏥': { importFrom: 'fa6', importName: 'FaHospital', jsx: '<FaHospital />', label: 'hospital' },
  '🌊': { importFrom: 'fa6', importName: 'FaWater', jsx: '<FaWater />', label: 'water' },
  '⚓': { importFrom: 'fa6', importName: 'FaAnchor', jsx: '<FaAnchor />', label: 'anchor' },
  '🧲': { importFrom: 'fa6', importName: 'FaMagnet', jsx: '<FaMagnet />', label: 'magnet' },
  '🎁': { importFrom: 'fa6', importName: 'FaGift', jsx: '<FaGift />', label: 'gift-box' },
  '🏅': { importFrom: 'fa6', importName: 'FaAward', jsx: '<FaAward />', label: 'award' },
  '📣': { importFrom: 'fa6', importName: 'FaMegaphone', jsx: '<FaMegaphone />', label: 'megaphone' },
  '🔊': { importFrom: 'fa6', importName: 'FaVolumeHigh', jsx: '<FaVolumeHigh />', label: 'volume-high' },
  '🔇': { importFrom: 'fa6', importName: 'FaVolumeMute', jsx: '<FaVolumeMute />', label: 'mute' },
  '🌀': { importFrom: 'fa6', importName: 'FaSpinner', jsx: '<FaSpinner />', label: 'spinner' },
  '🪐': { importFrom: 'fa6', importName: 'FaSatellite', jsx: '<FaSatellite />', label: 'planet' },
  '🧭': { importFrom: 'fa6', importName: 'FaCompass', jsx: '<FaCompass />', label: 'compass' },
  '🔏': { importFrom: 'fa6', importName: 'FaFileCircleLock', jsx: '<FaFileCircleLock />', label: 'file-lock' },
  '🖥': { importFrom: 'fa6', importName: 'FaDisplay', jsx: '<FaDisplay />', label: 'display' },
  '🪟': { importFrom: 'fa6', importName: 'FaWindowMaximize', jsx: '<FaWindowMaximize />', label: 'window' },
  '🗑': { importFrom: 'fa6', importName: 'FaTrashCan', jsx: '<FaTrashCan />', label: 'trash-can' },
};

const FRAMEWORK_EXCLUDE = '{**/node_modules/**,.next/**,.nuxt/**,.output/**,.turbo/**,**/dist/**,**/.cache/**,**/build/**,**/__next/**,**/_next/**}';

const diagnosticCollection = vscode.languages.createDiagnosticCollection('emojiToReactIcons');

function getMatches(text: string) {
  const regex = emojiRegex();
  const results: Array<{ emoji: string; index: number; mapping: IconMapping | null }> = [];
  for (const match of text.matchAll(regex)) {
    const emoji = match[0];
    const index = match.index ?? -1;
    results.push({ emoji, index, mapping: EMOJI_MAP[emoji] ?? null });
  }
  return results;
}

function buildImportLine(icons: IconMapping[]) {
  const unique = Array.from(new Map(icons.map((icon) => [icon.importName, icon])).values());
  const byPack = new Map<string, IconMapping[]>();
  for (const icon of unique) {
    const key = icon.importFrom;
    const existing = byPack.get(key) ?? [];
    existing.push(icon);
    byPack.set(key, existing);
  }
  return Array.from(byPack.entries())
    .map(([pack, packIcons]) =>
      `import { ${packIcons.map((icon) => icon.importName).sort().join(', ')} } from 'react-icons/${pack}';`
    )
    .join('\n');
}

function ensureImports(text: string, icons: IconMapping[]): string {
  if (icons.length === 0) return text;
  const importBlock = buildImportLine(icons);
  const lines = text.split(/\r?\n/);
  const existingImports = lines.filter((l) => l.startsWith('import ')).join('\n');
  const missingLines = importBlock.split('\n').filter((l) => l && !existingImports.includes(l));
  if (missingLines.length === 0) return text;
  const lastImportIndex = lines.reduce((acc, line, i) => (line.startsWith('import ') ? i : acc), -1);
  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, ...missingLines);
    return lines.join('\n');
  }
  return missingLines.join('\n') + '\n\n' + text;
}

function replaceText(text: string) {
  const matches = getMatches(text);
  const supported = matches.filter((m) => m.mapping);
  const unsupported = matches.filter((m) => !m.mapping).map((m) => m.emoji);
  let updated = text;
  for (const match of [...supported].reverse()) {
    updated =
      updated.slice(0, match.index) +
      match.mapping!.jsx +
      updated.slice(match.index + match.emoji.length);
  }
  updated = ensureImports(updated, supported.map((m) => m.mapping!));
  return { updated, supportedCount: supported.length, unsupported: Array.from(new Set(unsupported)) };
}

async function replaceRange(editor: vscode.TextEditor, range: vscode.Range): Promise<boolean> {
  const original = editor.document.getText(range);
  const result = replaceText(original);
  if (result.supportedCount === 0 && result.unsupported.length === 0) {
    vscode.window.showInformationMessage('No emoji found.');
    return false;
  }
  const ok = await editor.edit((eb) => eb.replace(range, result.updated));
  if (!ok) {
    const msg = `[EmojiToReactIcons] Failed to apply edit to ${editor.document.fileName}`;
    console.error(msg);
    vscode.window.showErrorMessage('Could not apply emoji replacement. Check the Output panel for details.');
    getOrCreateScanChannel().appendLine(msg);
    return false;
  }
  const extra = result.unsupported.length
    ? ` Unsupported emoji skipped: ${result.unsupported.join(' ')}`
    : '';
  vscode.window.showInformationMessage(`Replaced ${result.supportedCount} emoji with react-icons JSX.${extra}`);
  return result.supportedCount > 0;
}

type WorkspaceMatch = {
  uri: vscode.Uri;
  relativePath: string;
  line: number;
  col: number;
  emoji: string;
  mapping: IconMapping | null;
};

async function scanWorkspaceFiles(hideUnsupported: boolean): Promise<WorkspaceMatch[]> {
  const files = await vscode.workspace.findFiles(
    '**/*.{js,jsx,ts,tsx,mjs,cjs}',
    FRAMEWORK_EXCLUDE
  );
  const results: WorkspaceMatch[] = [];
  for (const uri of files) {
    let doc: vscode.TextDocument;
    try {
      doc = await vscode.workspace.openTextDocument(uri);
    } catch (err) {
      console.error(`[EmojiToReactIcons] Could not open document: ${uri.fsPath}`, err);
      continue;
    }
    const text = doc.getText();
    const matches = getMatches(text);
    const relativePath = vscode.workspace.asRelativePath(uri);
    for (const m of matches) {
      if (hideUnsupported && !m.mapping) continue;
      const pos = doc.positionAt(m.index);
      results.push({
        uri,
        relativePath,
        line: pos.line + 1,
        col: pos.character + 1,
        emoji: m.emoji,
        mapping: m.mapping,
      });
    }
  }
  return results;
}

let workspaceScanChannel: vscode.OutputChannel | undefined;
let hasScannedOnce = false;

function getOrCreateScanChannel() {
  if (!workspaceScanChannel) workspaceScanChannel = vscode.window.createOutputChannel('Emoji to React Icons — Workspace');
  return workspaceScanChannel;
}

function updateDiagnostics(matches: WorkspaceMatch[]) {
  diagnosticCollection.clear();
  const byUri = new Map<string, { uri: vscode.Uri; diagnostics: vscode.Diagnostic[] }>();
  for (const m of matches) {
    const key = m.uri.toString();
    if (!byUri.has(key)) byUri.set(key, { uri: m.uri, diagnostics: [] });
    const range = new vscode.Range(
      new vscode.Position(m.line - 1, m.col - 1),
      new vscode.Position(m.line - 1, m.col - 1 + [...m.emoji].length)
    );
    const message = m.mapping
      ? `Emoji ${m.emoji} → replace with <${m.mapping.importName} /> from react-icons/${m.mapping.importFrom}`
      : `Emoji ${m.emoji} has no react-icons mapping`;
    const severity = m.mapping ? vscode.DiagnosticSeverity.Information : vscode.DiagnosticSeverity.Hint;
    const diag = new vscode.Diagnostic(range, message, severity);
    diag.source = 'Emoji to React Icons';
    diag.code = m.mapping ? { value: m.mapping.importName, target: vscode.Uri.parse(`https://react-icons.github.io/react-icons/search?q=${m.mapping.importName}`) } : undefined;
    byUri.get(key)!.diagnostics.push(diag);
  }
  for (const { uri, diagnostics } of byUri.values()) {
    diagnosticCollection.set(uri, diagnostics);
  }
}

async function runWorkspaceScan(hideUnsupported: boolean, silent = false) {
  const channel = getOrCreateScanChannel();
  if (!silent) {
    channel.clear();
    channel.appendLine('Scanning workspace...');
    channel.show(true);
  }
  let matches: WorkspaceMatch[];
  try {
    matches = await scanWorkspaceFiles(hideUnsupported);
  } catch (err) {
    const msg = `[EmojiToReactIcons] Workspace scan failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(msg, err);
    channel.appendLine(msg);
    vscode.window.showErrorMessage('Emoji scan failed. Check the Output panel for details.');
    return;
  }
  updateDiagnostics(matches);
  channel.clear();
  if (matches.length === 0) {
    channel.appendLine(hideUnsupported ? 'No supported emoji found in workspace.' : 'No emoji found in workspace.');
    return;
  }
  const byFile = new Map<string, WorkspaceMatch[]>();
  for (const m of matches) {
    const existing = byFile.get(m.relativePath) ?? [];
    existing.push(m);
    byFile.set(m.relativePath, existing);
  }
  let total = 0;
  for (const [, items] of byFile.entries()) {
    const firstItem = items[0];
    const absPath = firstItem.uri.fsPath;
    channel.appendLine(`\n${absPath}`);
    for (const item of items) {
      const icon = item.mapping ? ` → ${item.mapping.importName} (react-icons/${item.mapping.importFrom})` : ' (unsupported)';
      const emojiPart = hideUnsupported ? '' : ` ${item.emoji}`;
      channel.appendLine(`  Line ${item.line}, Col ${item.col}:${emojiPart}${icon}`);
      total++;
    }
  }
  channel.appendLine(`\n─────────────────────────`);
  channel.appendLine(`Total: ${total} emoji across ${byFile.size} file(s)`);
}

function startAutoScan(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('emojiToReactIcons');
  if (!config.get<boolean>('autoScan', true)) return;
  if (!hasScannedOnce) {
    hasScannedOnce = true;
    const hideUnsupported = config.get<boolean>('hideUnsupportedInScan', false);
    runWorkspaceScan(hideUnsupported);
  }
  const disposable = vscode.workspace.onDidSaveTextDocument((doc) => {
    const cfg = vscode.workspace.getConfiguration('emojiToReactIcons');
    if (!cfg.get<boolean>('autoScan', true)) return;
    const matches = getMatches(doc.getText());
    const hideUnsupported = cfg.get<boolean>('hideUnsupportedInScan', false);
    const filtered = hideUnsupported ? matches.filter((m) => m.mapping) : matches;
    const diagnostics: vscode.Diagnostic[] = [];
    for (const m of filtered) {
      const pos = doc.positionAt(m.index);
      const range = new vscode.Range(pos, new vscode.Position(pos.line, pos.character + [...m.emoji].length));
      const message = m.mapping
        ? `Emoji ${m.emoji} → replace with <${m.mapping!.importName} /> from react-icons/${m.mapping!.importFrom}`
        : `Emoji ${m.emoji} has no react-icons mapping`;
      const severity = m.mapping ? vscode.DiagnosticSeverity.Information : vscode.DiagnosticSeverity.Hint;
      const diag = new vscode.Diagnostic(range, message, severity);
      diag.source = 'Emoji to React Icons';
      diag.code = m.mapping ? { value: m.mapping.importName, target: vscode.Uri.parse(`https://react-icons.github.io/react-icons/search?q=${m.mapping.importName}`) } : undefined;
      diagnostics.push(diag);
    }
    diagnosticCollection.set(doc.uri, diagnostics);
  });
  context.subscriptions.push(disposable);
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(diagnosticCollection);
  startAutoScan(context);
  context.subscriptions.push(
    vscode.commands.registerCommand('emojiToReactIcons.scanCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }
      const doc = editor.document;
      const text = doc.getText();
      const matches = getMatches(text);
      if (matches.length === 0) { vscode.window.showInformationMessage('No emoji found in the current file.'); return; }
      const supported = matches.filter((m) => m.mapping);
      const unsupported = Array.from(new Set(matches.filter((m) => !m.mapping).map((m) => m.emoji)));
      const channel = vscode.window.createOutputChannel('Emoji to React Icons — Current File');
      channel.clear();
      channel.appendLine(`=== Emoji scan: ${doc.uri.fsPath} ===\n`);
      const byLine = new Map<number, typeof matches>();
      for (const m of matches) {
        const pos = doc.positionAt(m.index);
        const line = pos.line + 1;
        const existing = byLine.get(line) ?? [];
        existing.push(m);
        byLine.set(line, existing);
      }
      for (const [line, items] of [...byLine.entries()].sort((a, b) => a[0] - b[0])) {
        for (const item of items) {
          const pos = doc.positionAt(item.index);
          const col = pos.character + 1;
          const icon = item.mapping
            ? `${item.mapping.importName} from react-icons/${item.mapping.importFrom}`
            : '(unsupported)';
          channel.appendLine(`  Line ${line}, Col ${col}: ${item.emoji}  →  ${icon}`);
        }
      }
      channel.appendLine(`\n─────────────────────────`);
      channel.appendLine(`Replaceable: ${supported.length}  |  Unsupported: ${unsupported.length}`);
      if (unsupported.length) channel.appendLine(`Unsupported: ${unsupported.join(' ')}`);
      channel.show(true);
      vscode.window.showInformationMessage(
        `Found ${matches.length} emoji. Replaceable: ${supported.length}.${unsupported.length ? ' Unsupported: ' + unsupported.join(' ') : ''}`
      );
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a JSX/TSX file first.'); return; }
      const doc = editor.document;
      const range = new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
      const changed = await replaceRange(editor, range);
      if (changed) {
        const channel = getOrCreateScanChannel();
        channel.appendLine(`\n✔ Replaced emoji in: ${doc.uri.fsPath}`);
        diagnosticCollection.set(doc.uri, []);
      }
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceSelection', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage('Open a file first.'); return; }
      const doc = editor.document;
      const range = editor.selection && !editor.selection.isEmpty
        ? new vscode.Range(editor.selection.start, editor.selection.end)
        : new vscode.Range(doc.positionAt(0), doc.positionAt(doc.getText().length));
      const changed = await replaceRange(editor, range);
      if (changed) {
        const channel = getOrCreateScanChannel();
        channel.appendLine(`\n✔ Replaced emoji in selection: ${doc.uri.fsPath}`);
      }
    }),
    vscode.commands.registerCommand('emojiToReactIcons.scanWorkspace', async () => {
      const config = vscode.workspace.getConfiguration('emojiToReactIcons');
      const hideUnsupported = config.get<boolean>('hideUnsupportedInScan', false);
      await runWorkspaceScan(hideUnsupported);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.replaceWorkspace', async () => {
      if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showWarningMessage('No workspace folder open.');
        return;
      }
      const confirm = await vscode.window.showWarningMessage(
        'Replace all emoji with react-icons JSX across the entire workspace?',
        { modal: true },
        'Replace All'
      );
      if (confirm !== 'Replace All') return;
      const files = await vscode.workspace.findFiles('**/*.{js,jsx,ts,tsx,mjs,cjs}', FRAMEWORK_EXCLUDE);
      let totalFiles = 0;
      let totalReplaced = 0;
      const changedFiles: string[] = [];
      for (const uri of files) {
        let doc: vscode.TextDocument;
        try {
          doc = await vscode.workspace.openTextDocument(uri);
        } catch (err) {
          console.error(`[EmojiToReactIcons] Could not open file for replacement: ${uri.fsPath}`, err);
          continue;
        }
        const text = doc.getText();
        const result = replaceText(text);
        if (result.supportedCount === 0) continue;
        const edit = new vscode.WorkspaceEdit();
        const fullRange = new vscode.Range(doc.positionAt(0), doc.positionAt(text.length));
        edit.replace(uri, fullRange, result.updated);
        const ok = await vscode.workspace.applyEdit(edit);
        if (!ok) {
          console.error(`[EmojiToReactIcons] Failed to apply workspace edit to: ${uri.fsPath}`);
          continue;
        }
        try {
          await doc.save();
        } catch (err) {
          console.error(`[EmojiToReactIcons] Failed to save file: ${uri.fsPath}`, err);
          continue;
        }
        diagnosticCollection.set(uri, []);
        totalFiles++;
        totalReplaced += result.supportedCount;
        changedFiles.push(uri.fsPath);
      }
      const channel = getOrCreateScanChannel();
      channel.clear();
      if (totalReplaced === 0) {
        channel.appendLine('No emoji found across workspace.');
        vscode.window.showInformationMessage('No emoji found across workspace.');
      } else {
        channel.appendLine(`=== Workspace Replacement Results ===\n`);
        channel.appendLine(`Replaced ${totalReplaced} emoji in ${totalFiles} file(s):\n`);
        for (const filePath of changedFiles) {
          channel.appendLine(`  ✔ ${filePath}`);
        }
        channel.appendLine(`\n─────────────────────────`);
        channel.appendLine(`Total: ${totalReplaced} replacements across ${totalFiles} file(s)`);
        channel.show(true);
        vscode.window.showInformationMessage(
          `Replaced ${totalReplaced} emoji in ${totalFiles} file(s). See Output panel for details.`
        );
      }
      const config = vscode.workspace.getConfiguration('emojiToReactIcons');
      await runWorkspaceScan(config.get<boolean>('hideUnsupportedInScan', false), true);
    }),
    vscode.commands.registerCommand('emojiToReactIcons.showEmojiMap', async () => {
      const channel = vscode.window.createOutputChannel('Emoji to React Icons — Full Map');
      channel.clear();
      channel.appendLine('=== Emoji → React Icons Mapping ===\n');
      const entries = Object.entries(EMOJI_MAP).sort((a, b) => a[1].importFrom.localeCompare(b[1].importFrom) || a[1].importName.localeCompare(b[1].importName));
      const byPack = new Map<string, typeof entries>();
      for (const entry of entries) {
        const pack = entry[1].importFrom;
        const existing = byPack.get(pack) ?? [];
        existing.push(entry);
        byPack.set(pack, existing);
      }
      for (const [pack, packEntries] of byPack.entries()) {
        channel.appendLine(`react-icons/${pack}:`);
        for (const [emoji, mapping] of packEntries) {
          channel.appendLine(`  ${emoji}  →  <${mapping.importName} />  (${mapping.label})`);
        }
        channel.appendLine('');
      }
      channel.appendLine(`─────────────────────────`);
      channel.appendLine(`Total mappings: ${Object.keys(EMOJI_MAP).length}`);
      channel.show(true);
    })
  );
}

export function deactivate() {
  workspaceScanChannel?.dispose();
  workspaceScanChannel = undefined;
  diagnosticCollection.dispose();
}