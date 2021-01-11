import axios from 'axios';
import Test from './componetns/component';
import Test2 from './componetns/component2';

axios.get('https://jsonplaceholder.typicode.com/posts')
		.then( resp => console.log(resp.data));

Test();
Test2();
