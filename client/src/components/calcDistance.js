export default function calcDistance(coordinat1, coordinat2) {
  const lat1 = parseFloat(coordinat1.split(",")[0]);
  const lon1 = parseFloat(coordinat1.split(",")[1]);
  const lat2 = parseFloat(coordinat2.split(",")[0]);
  const lon2 = parseFloat(coordinat2.split(",")[1]);
  const R = 6371; // Radius of the earth in km
  
  const dLat = (lat2-lat1) * (Math.PI/180);
  const dLon = (lon2-lon1) * (Math.PI/180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = parseFloat((R * c).toPrecision(3)).toLocaleString('id-ID'); // Distance in km
  return d;
}

// function deg2rad(deg) {
//   return deg * (Math.PI/180)
// }