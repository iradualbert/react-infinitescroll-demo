import { useState, useEffect, useRef } from "react";
import "./App.css";
import NewsCard from "./components/NewsCard";
import axios from "axios";

const App = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [articles, setArticles] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [query, setQuery] = useState("");

	const loader = useRef();

	useEffect(() => {
		if (isLoading) return;
		const handleObserver = (entries) => {
			const loaderEntry = entries[0];
			if (loaderEntry.isIntersecting) {
				console.log("You scrolled to the bottom");
				setCurrentPage(currentPage + 1);
			}
		};
		const options = {
			root: null,
			rootMargin: "0px",
			threshold: 0.1,
		};
		const observer = new IntersectionObserver(handleObserver, options);
		if (loader.current) {
			observer.observe(loader.current);
		}
	}, [loader, isLoading]);

	useEffect(() => {
		setIsLoading(true);
		const fetchData = async () => {
			try {
				const { data } = await axios.get(
					"https://hn.algolia.com/api/v1/search?",
					{
						params: { page: currentPage, query },
					}
				);
				const { hits } = data;
				setArticles((previousArticles) => previousArticles.concat(hits));
			} catch (error) {
				console.log(error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, [query, currentPage]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setCurrentPage(0);
		setQuery(searchText);
	};

	return (
		<div className="container">
			<h1>Hacker News</h1>
			<form className="search-form" onSubmit={handleSubmit}>
				<input
					placeholder="Search for news"
					value={searchText}
					onChange={(e) => setSearchText(e.target.value)}
				/>
				<button type="submit">Search</button>
			</form>
			{
				<div className="news-cards">
					{articles.map((article) => (
						<NewsCard article={article} key={article.objectID} />
					))}
					<p ref={loader}>Loading More....</p>
				</div>
			}
		</div>
	);
};

export default App;
