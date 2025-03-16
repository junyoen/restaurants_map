// 지도 관련 변수 선언
let map;
let markers = [];
let infowindows = [];

// 지도 초기화 함수
function initMap() {
    // 기본 중심 좌표 (서울시청)
    const defaultCenter = new kakao.maps.LatLng(37.566826, 126.9786567);
    
    // 지도 생성
    const container = document.getElementById('map');
    const options = {
        center: defaultCenter,
        level: 5  // 확대 레벨 (낮을수록 확대)
    };
    
    map = new kakao.maps.Map(container, options);
    
    // 지도 생성 확인 로그
    console.log("카카오맵 초기화 완료");
    
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
        const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);
        
        // 마커 생성
        const marker = new kakao.maps.Marker({
            position: position,
            map: map
        });
        
        // 인포윈도우(정보창) 내용 구성
        const infoContent = `
            <div class="info-window">
                <h3>${restaurant.name}</h3>
                <p>카테고리: ${restaurant.category}</p>
                <p>주소: ${restaurant.address || '정보 없음'}</p>
                <p>전화: ${restaurant.phone || '정보 없음'}</p>
                <p>메뉴: ${restaurant.menu || '정보 없음'}</p>
            </div>
        `;
        
        // 인포윈도우 생성
        const infowindow = new kakao.maps.InfoWindow({
            content: infoContent,
            removable: true
        });
        
        // 마커 클릭 시 인포윈도우 표시
        kakao.maps.event.addListener(marker, 'click', function() {
            // 다른 인포윈도우 닫기
            closeAllInfoWindows();
            infowindow.open(map, marker);
            // 인포윈도우 배열에 추가
            infowindows.push(infowindow);
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
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    closeAllInfoWindows();
}

// 모든 인포윈도우 닫기
function closeAllInfoWindows() {
    for (let i = 0; i < infowindows.length; i++) {
        infowindows[i].close();
    }
    infowindows = [];
}

// 지도 범위 재설정 함수
function adjustMapBounds(restaurants) {
    // LatLngBounds 객체 생성
    const bounds = new kakao.maps.LatLngBounds();
    
    // 모든 맛집 좌표를 bounds에 추가
    restaurants.forEach(restaurant => {
        bounds.extend(new kakao.maps.LatLng(restaurant.lat, restaurant.lng));
    });
    
    // 지도 범위 재설정
    map.setBounds(bounds);
}

// 전역 변수
let restaurantData = [];

// JSON 데이터 로드 함수
function loadRestaurantData() {
    fetch('./data/restaurants.json')
        .then(response => response.json())
        .then(data => {
            restaurantData = data;
            console.log('맛집 데이터 로드 완료:', restaurantData.length + '개');
            
            // 지도에 마커 표시
            displayMarkers(restaurantData);
            
            // 카테고리 버튼 이벤트 설정
            setupCategoryButtons();
        })
        .catch(error => console.error('데이터 로드 오류:', error));
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

// 카카오맵 API가 로드된 후 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM 로드 완료, 카카오맵 API 로드 시작");
    // autoload=false 옵션으로 지정했기 때문에 명시적으로 로드
    kakao.maps.load(function() {
        console.log("카카오맵 API 로드 완료");
        initMap();
    });
});