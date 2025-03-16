// 지도 관련 변수 선언
let map;
let markers = [];
let infoWindows = [];

// 지도 초기화 함수
function initMap() {
    // 기본 중심 좌표 (서울시청)
    const defaultCenter = new naver.maps.LatLng(37.566826, 126.9786567);
    
    // 지도 생성
    map = new naver.maps.Map('map', {
        center: defaultCenter,
        zoom: 12,  // 확대 레벨
        zoomControl: true,
        zoomControlOptions: {
            position: naver.maps.Position.TOP_RIGHT
        }
    });
    
    // 지도 생성 확인 로그
    console.log("네이버 지도 초기화 완료");
    
    // 맛집 데이터 로드
    loadRestaurantData();
}

// 마커 표시 함수
function displayMarkers(restaurants, category = 'all') {
    // 기존 마커 삭제
    removeAllMarkers();
    
    // 카테고리별 필터링
    const filteredRestaurants = category === 'all' 
        ? restaurants 
        : restaurants.filter(r => r.category === category);
    
    console.log(`카테고리 [${category}] 선택: ${filteredRestaurants.length}개 맛집 표시`);
    
    // 마커 생성 및 표시
    filteredRestaurants.forEach(restaurant => {
        const position = new naver.maps.LatLng(restaurant.lat, restaurant.lng);
        
        // 마커 생성
        const marker = new naver.maps.Marker({
            position: position,
            map: map,
            title: restaurant.name,
            icon: {
                content: `<div class="marker">${restaurant.name}</div>`,
                anchor: new naver.maps.Point(20, 20)
            }
        });
        
        // 인포윈도우 내용 구성
        const infoContent = `
            <div class="info-window">
                <h3>${restaurant.name}</h3>
                <p class="category">카테고리: ${restaurant.category}</p>
                <p>주소: ${restaurant.address || '정보 없음'}</p>
                <p>전화: ${restaurant.phone || '정보 없음'}</p>
                ${restaurant.menu ? `<p>메뉴: ${restaurant.menu}</p>` : ''}
            </div>
        `;
        
        // 인포윈도우 생성
        const infoWindow = new naver.maps.InfoWindow({
            content: infoContent,
            maxWidth: 300,
            backgroundColor: "#fff",
            borderColor: "#ccc",
            borderWidth: 2,
            anchorSize: new naver.maps.Size(20, 10),
            pixelOffset: new naver.maps.Point(0, -10)
        });
        
        // 마커 클릭 이벤트 설정
        naver.maps.Event.addListener(marker, 'click', function() {
            // 다른 인포윈도우 닫기
            closeAllInfoWindows();
            
            // 현재 인포윈도우 열기
            infoWindow.open(map, marker);
            
            // 인포윈도우 배열에 추가
            infoWindows.push(infoWindow);
        });
        
        // 마커 배열에 추가
        markers.push(marker);
    });
    
    // 마커가 있으면 지도 범위 재설정
    if (filteredRestaurants.length > 0) {
        adjustMapBounds(filteredRestaurants);
    }
}

// 모든 마커 제거 함수
function removeAllMarkers() {
    markers.forEach(marker => {
        marker.setMap(null);
    });
    markers = [];
    closeAllInfoWindows();
}

// 모든 인포윈도우 닫기
function closeAllInfoWindows() {
    infoWindows.forEach(infoWindow => {
        infoWindow.close();
    });
    infoWindows = [];
}

// 지도 범위 재설정 함수
function adjustMapBounds(restaurants) {
    if (restaurants.length === 0) return;
    
    // 경계 객체 생성
    const bounds = new naver.maps.LatLngBounds();
    
    // 모든 맛집 좌표를 bounds에 추가
    restaurants.forEach(restaurant => {
        bounds.extend(new naver.maps.LatLng(restaurant.lat, restaurant.lng));
    });
    
    // 지도 범위 재설정 (약간 여유를 두기 위해 padding 추가)
    map.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    });
}

// 전역 변수
let restaurantData = [];

// JSON 데이터 로드 함수
function loadRestaurantData() {
    fetch('data/restaurants.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP 에러! 상태: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            restaurantData = data;
            console.log('맛집 데이터 로드 완료:', restaurantData.length + '개');
            
            // 지도에 마커 표시
            displayMarkers(restaurantData);
            
            // 카테고리 버튼 이벤트 설정
            setupCategoryButtons();
        })
        .catch(error => {
            console.error('데이터 로드 오류:', error);
            
            // 오류 시 샘플 데이터 생성 (테스트용)
            createSampleData();
        });
}

// 샘플 데이터 생성 (데이터 로드 실패 시)
function createSampleData() {
    console.log('샘플 데이터 생성 중...');
    restaurantData = [
        {
            name: "을지면옥",
            category: "한식",
            lat: 37.566826,
            lng: 126.982652,
            address: "서울 중구 명동길 42",
            phone: "02-123-4567",
            menu: "평양냉면, 불고기"
        },
        {
            name: "탕화쿵푸",
            category: "중식",
            lat: 37.574231,
            lng: 126.976904,
            address: "서울 종로구 종로8길 16",
            phone: "02-987-6543",
            menu: "마라탕, 꿔바로우"
        },
        {
            name: "스시효",
            category: "일식",
            lat: 37.526320,
            lng: 127.035473,
            address: "서울 강남구 강남대로 552",
            phone: "02-555-7890",
            menu: "오마카세, 사시미"
        },
        {
            name: "빌라드샬롯",
            category: "양식",
            lat: 37.540256,
            lng: 127.068254,
            address: "서울 광진구 아차산로 200",
            phone: "02-432-5678",
            menu: "파스타, 스테이크"
        },
        {
            name: "디저트39",
            category: "카페",
            lat: 37.556827,
            lng: 126.926520,
            address: "서울 마포구 와우산로 29",
            phone: "02-332-9988",
            menu: "티라미수, 딸기케이크"
        }
    ];
    
    // 샘플 데이터로 지도 표시
    displayMarkers(restaurantData);
    
    // 카테고리 버튼 이벤트 설정
    setupCategoryButtons();
}

// 카테고리 버튼 이벤트 설정
function setupCategoryButtons() {
    const buttons = document.querySelectorAll('.category-buttons button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // 기존 active 클래스 제거
            buttons.forEach(btn => btn.classList.remove('active'));
            
            // 클릭한 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 선택한 카테고리 가져오기
            const selectedCategory = this.getAttribute('data-category');
            
            // 해당 카테고리의 맛집만 표시
            displayMarkers(restaurantData, selectedCategory);
        });
    });
}

// 페이지 로드 시 지도 초기화
document.addEventListener('DOMContentLoaded', initMap);
