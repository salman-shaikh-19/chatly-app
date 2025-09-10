import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
// import InfiniteScroll from "react-infinite-scroll-component";
const CustomInfiniteScroll=({ data, pageSize, children, scrollTargetId,endMsg='' })=> {

    const [dataToScroll, setDataToScroll] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    
    const loadMoreData = useCallback(() => {
        if (!data || data.length === 0) {
            setHasMore(false);
            return;
        }
        // console.log('load more called');

        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const nextData = data.slice(start, end);

        setDataToScroll((prev) => [...prev, ...nextData]);
        setPage((prevPage) => prevPage + 1);

        if (end >= data.length) {
            setHasMore(false);
        }
    }, [data, page, pageSize]);

    useEffect(() => {
      if (!data || data.length === 0) {
        //reset if no data
        setDataToScroll([]);
        setHasMore(false);
        setPage(1);
        return;
    }

        setDataToScroll([]);
        setPage(1);
        setHasMore(data?.length > 0);

    }, [data, pageSize]);

    useEffect(() => {
        if (data?.length > 0 && page === 1) {
            loadMoreData();
        }
    }, [page, data, loadMoreData]);

    // memrozie children rendering to avoid unnecessary re-render
    const renderedChildren = useMemo(() => {
        return children(dataToScroll);
    }, [dataToScroll, children]);
    return (
        <>

            <InfiniteScroll
                dataLength={dataToScroll.length}
                next={loadMoreData}
                hasMore={hasMore}
                loader={<div className="d-flex justify-content-center align-item-center text-gray-600" style={{height:"100vh"}}><center><p><FontAwesomeIcon icon={faSpinner} spin size="2x" /></p></center></div>}
                endMessage={<><div className="text-center text-gray-600"><span className=" fw-bold">{endMsg}</span></div></>}
                scrollableTarget={scrollTargetId}
            >
                {renderedChildren}
            </InfiniteScroll>
        </>
    )

}

export default CustomInfiniteScroll
