import { useEffect } from "react";
import axios from "axios";

function App() {

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get("http://localhost:5000/");
      console.log(data);
    };

    fetchProducts();
  }, []);

  return <h1>Check console</h1>;
}

export default App;