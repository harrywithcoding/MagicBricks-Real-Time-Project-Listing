// app/city/[cityName]/page.jsx
import ClientCityView from '../../../components/ClientCityView';

export default async function CityPage({ params }) {
  const { cityName } = await params;
  console.log("City:", cityName);
  return (
    <>
     
      <>
        <ClientCityView cityName={cityName} />
      </>
    </>
  );
}
