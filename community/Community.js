import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, View, TouchableOpacity, Modal, ScrollView, TouchableWithoutFeedback, TextInput, Keyboard } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import axios from 'axios';
import config from '../config'; // SafetyInfo.js와 동일한 config 파일 사용

function Community({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [safetyInfos, setSafetyInfos] = useState([]);
  const [coverImages, setCoverImages] = useState({}); // 카드 표지 이미지를 저장하는 상태
  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const [images, setImages] = useState([]); // 선택된 안전 뉴스 카드의 이미지들을 저장
  const [currentImageIndex, setCurrentImageIndex] = useState(0); // 모달 이미지 인덱스 관리
  
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const today = new Date();
  const todayIndex = today.getDay();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const datesOfWeek = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date.getDate();
  });

  const filters = ['전체', 'HOT', '교통', '시위', '재해', '주의'];
  const categories = ['전체', '자연', '사회', '생활'];

  const posts = [
    { category: 'HOT', title: '2호선 강남역 근처 시위', message: '2호선 강남역 근처에서 시위 때문에 교통정체가 심하니 다들 참고 하세요 !!!', timestamp: '2분전' },
    { category: '교통', title: '3호선 서울역 혼잡', message: '3호선 서울역에서 승객 수가 많아서 혼잡할 수 있습니다.', timestamp: '2024.07.24 pm 15:30' },
    { category: '시위', title: '시민 시위', message: '시민들이 시위를 벌이고 있습니다. 주의하시기 바랍니다.', timestamp: '2024.07.24 pm 15:20' },
    { category: '재해', title: '비로 인한 미끄러움', message: '비가 오고 있어서 길이 미끄럽습니다. 운전에 주의하세요.', timestamp: '2024.07.24 pm 15:10' },
    { category: '주의', title: '해수욕장 물때', message: '해수욕장에서 물때가 높습니다. 안전을 위해 신호를 따르세요.', timestamp: '2024.07.24 pm 15:00' },
  ];

  const filteredInfos = selectedFilter === '전체' ? safetyInfos : safetyInfos.filter(info => info.category === selectedFilter);
  const menuItems = [
    { id: '1', title: '내 주변 안전소식', navigateTo: 'NearbySafety', filter: null },
    { id: '2', title: '전체', navigateTo: 'NearbySafety', filter: '전체' },
    { id: '3', title: 'HOT', navigateTo: 'NearbySafety', filter: 'HOT' },
    { id: '4', title: '교통', navigateTo: 'NearbySafety', filter: '교통' },
    { id: '5', title: '시위', navigateTo: 'NearbySafety', filter: '시위' },
    { id: '6', title: '재해', navigateTo: 'NearbySafety', filter: '재해' },
    { id: '7', title: '주의', navigateTo: 'NearbySafety', filter: '주의' },
    { id: '8', title: '안전 정보', navigateTo: 'SafetyInfo', filter: null },
    { id: '9', title: '전체', navigateTo: 'SafetyInfo', filter: '전체' },
    { id: '10', title: '자연', navigateTo: 'SafetyInfo', filter: '자연' },
    { id: '11', title: '사회', navigateTo: 'SafetyInfo', filter: '사회' },
    { id: '12', title: '생활', navigateTo: 'SafetyInfo', filter: '생활' }
  ];

  // 안전정보 데이터 및 각 카드의 표지 이미지 가져오기
  useEffect(() => {
    const fetchSafetyInfos = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/safetyInfos`);
        setSafetyInfos(response.data); // 데이터를 state에 저장
        await fetchCoverImages(response.data); // 각 카드의 표지 이미지 가져오기
        setLoading(false); // 데이터 로딩 완료
      } catch (error) {
        console.error('Error fetching safety info:', error);
        setLoading(false);
      }
    };

    fetchSafetyInfos();
  }, []);

  // 모든 카드의 표지 이미지를 가져오는 함수
  const fetchCoverImages = async (infos) => {
    const images = {};
    for (const info of infos) {
      const image = await fetchCoverImage(info.id);
      if (image) {
        images[info.id] = image; // 각 카드의 ID를 키로 하여 이미지 URL을 저장
      }
    }
    setCoverImages(images); // 모든 표지 이미지를 상태에 저장
  };

  // 각 게시물의 표지 이미지를 불러오는 함수
  const fetchCoverImage = async (infoId) => {
    try {
      const imageResponse = await axios.get(`${config.apiUrl}/cardnews/${infoId}`);
      return imageResponse.data[0]; // 첫 번째 이미지를 반환
    } catch (error) {
      console.error('Error fetching cover image:', error);
      return null; // 이미지가 없을 경우 null 반환
    }
  };

  // 선택된 안전 뉴스 카드의 이미지를 가져오는 함수
  const fetchImages = async (infoId) => {
    try {
      const response = await axios.get(`${config.apiUrl}/cardnews/${infoId}`); // 해당 정보 ID로 이미지 가져오기
      setImages(response.data); // 가져온 이미지 목록 설정
    } catch (error) {
      console.error('Error fetching images:', error);
      setImages([]); // 에러 발생 시 이미지 목록 초기화
    }
  };

  const handleInfoPress = async (info) => {
    setSelectedInfo(info);
    setInfoModalVisible(true);
    await fetchImages(info.id); // 선택된 안전 뉴스 카드의 모든 이미지를 가져오기
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setSearchHistory(prevHistory => [searchQuery, ...prevHistory]);
      setSearchQuery('');
    }
  };

  const deleteSearchHistoryItem = (index) => {
    setSearchHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail', { post });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>커뮤니티</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSearchModalVisible(true)}>
          <MaterialIcons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.calendar}>
          {daysOfWeek.map((day, index) => (
            <View key={index} style={[styles.day, index === todayIndex && styles.today]}>
              <Text style={[styles.dayText, (day === 'SUN' || day === 'SAT') ? styles.weekendText : styles.weekdayText]}>{day}</Text>
              <Text style={styles.dateText}>{datesOfWeek[index]}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity onPress={() => navigation.navigate('NearbySafety')}>
          <Text style={styles.safetyHeaderText}>
            내 주변 안전소식
            <View style={styles.icons}>
              <AntDesign name="right" size={16} color="black" />
            </View>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postContainer} onPress={() => handlePostPress(posts[0])}>
          <View style={styles.postHeader}>
            <Text style={styles.hotText}>[HOT]</Text>
          </View>
          <Text style={styles.postTitle}>{posts[0].message}</Text>
          <Text style={styles.hotTime}>{posts[0].timestamp}</Text>
        </TouchableOpacity>

        <View style={styles.safe}>
          <TouchableOpacity onPress={() => handlePostPress(posts[1])}>
            <Text style={styles.safeText}>[교통] 3호선 서울역에서 승객 수가 많아서 ...</Text>
            <Text style={styles.postTime}>{posts[1].timestamp}</Text>
          </TouchableOpacity>
          <View style={styles.horizontalLine}></View>
          <TouchableOpacity onPress={() => handlePostPress(posts[2])}>
            <Text style={styles.safeText}>[시위] 시민들이 시위를 벌이고 있습니다 ...</Text>
            <Text style={styles.postTime}>{posts[2].timestamp}</Text>
          </TouchableOpacity>
          <View style={styles.horizontalLine}></View>
          <TouchableOpacity onPress={() => handlePostPress(posts[4])}>
            <Text style={styles.safeText}>[주의] 해수욕장에서 물때가 높습니다. 안전 ...</Text>
            <Text style={styles.postTime}>{posts[4].timestamp}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.boldLine}></View>
        <TouchableOpacity onPress={() => navigation.navigate('SafetyInfo')}>
          <Text style={styles.infoHeader}>
            안전 정보
            <View style={styles.icons}>
              <AntDesign name="right" size={16} color="black" />
            </View>
          </Text>
        </TouchableOpacity>

        <View style={styles.categoryContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedFilter(category)}
              style={[
                styles.categoryButton,
                selectedFilter === category && styles.selectedCategoryButton
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedFilter === category && styles.selectedCategoryText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoCardsContainer}>
          {filteredInfos.map((info) => (
            <TouchableOpacity key={info.id} onPress={() => handleInfoPress(info)} style={styles.infoCardContainer}>
            <View style={styles.infoCard}>
              {/* 이미지 배경 설정 */}
              {coverImages[info.id] && (
                <Image
                  source={{ uri: coverImages[info.id] }} // 카드의 표지 이미지를 표시
                  style={styles.cardImageBackground} // 배경 이미지 스타일
                  opacity={0.45} 
                />
              )}
              <Text style={styles.infoTitle}>{info.title}</Text>
            </View>
            <View style={styles.infoFooter}>
              <Text style={styles.infoDate}>{info.date}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{info.category}</Text>
              </View>
            </View>
          </TouchableOpacity>          
          ))}
        </View>
      </ScrollView>

      {/* 메뉴 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.menuModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuModalContent}>
                <ScrollView contentContainerStyle={styles.menuItemsContainer}>
                  {menuItems.map(item => (
                    <TouchableOpacity 
                      key={item.id}
                      onPress={() => { 
                        setModalVisible(false); 
                        if (item.filter === null) {
                          navigation.navigate(item.navigateTo);
                        } else {
                          navigation.navigate(item.navigateTo, { filter: item.filter });
                        }
                      }}
                    >
                      <Text style={[styles.modalText, (item.title === '내 근처 안전소식' || item.title === '안전 정보') && styles.boldText]}>
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 검색 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSearchModalVisible(false)}>
          <View style={styles.searchModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.searchModalContent}>
                <View style={styles.searchHeader}>
                  <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.backButton}>
                    <MaterialIcons name="keyboard-arrow-left" size={30} color="black" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="검색어를 입력하세요"
                    placeholderTextColor="#888888" 
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                  />
                  <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                    <Text style={styles.searchButtonText}>검색</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.historyContainer}>
                  {searchHistory.map((item, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyIconContainer}>
                        <MaterialIcons name="history" size={24} color="black" />
                      </View>
                      <Text style={styles.historyText}>{item}</Text>
                      <TouchableOpacity onPress={() => deleteSearchHistoryItem(index)}>
                        <MaterialIcons name="close" size={24} color="black" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 정보 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedInfo?.title}</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setInfoModalVisible(false)}>
              <Text style={styles.modalCloseText}>X</Text>
            </TouchableOpacity>
            {images.length > 0 ? (
              <>
                <Image
                    key={currentImageIndex}
                    source={{ uri: images[currentImageIndex] }}
                    style={styles.cardImage}
                    resizeMode="contain" 
                />
                <View style={styles.imageNavigation}>
                  <TouchableOpacity onPress={handlePrevImage}>
                    <Text style={styles.navigationText}>이전</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextImage}>
                    <Text style={styles.navigationText}>다음</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text>No images available.</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: '7%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '3%',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
  },
  calendarContainer: {
    marginTop: '3%',
    padding: '1%',
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  day: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  today: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d3d3d3',
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  weekendText: {
    color: '#A51919',
  },
  weekdayText: {
    color: 'black',
  },
  dateText: {
    fontSize: 14,
    color: 'gray',
    fontWeight: 'bold',
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menuModalContent: {
    backgroundColor: 'white',
    padding: 30,
    paddingTop: 60,
    width: '50%',
    height: '90.5%',
    alignItems: 'flex-start',
  },
  searchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '100%',
    height: '100%', // 전체 높이를 차지하도록 설정
    justifyContent: 'flex-start', // 상단 정렬
    alignItems: 'center',
    paddingTop: 60, // 상단 여백 추가
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', // 전체 너비를 차지하도록 설정
    marginTop: 20, // 상단 여백 추가
  },
  backButton: {
    marginRight: 10, // 검색창과 버튼 사이 여백 추가
  },
  searchInput: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flex: 1, // 남은 공간을 차지하도록 설정
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchButton: {
    backgroundColor: '#556D6A',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10, // 검색창과 버튼 사이 여백 추가
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuItemsContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: '5%',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  filterText: {
    fontSize: 16,
    color: 'black',
  },
  selectedFilterText: {
    fontWeight: 'bold',
    color: 'blue',
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  safetyHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  safe: {
    marginBottom: 5,
  },
  safeItem: {
    marginVertical: 5,
  },
  safeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 10,
  },
  postContainer: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotText: {
    color: '#A51919',
    fontWeight: 'bold',
    marginRight: 5,
  },
  hotTime: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
    marginLeft: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  postTime: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'left',
    marginLeft: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  pageNumber: {
    fontSize: 16,
    marginRight: 10,
  },
  writeButton: {
    position: 'absolute',
    right: 0,
  },
  boldLine: {
    height: 3,
    backgroundColor: '#E7E7E7',
    marginVertical: 20,
  },
  infoHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 10,
  },
  categoryButton: {
    paddingHorizontal: 10,
    borderRadius: 15,
    paddingVertical: 5,
    marginRight: 5,
    backgroundColor: '#F3F3F3',
  },
  categoryText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  selectedCategoryButton: {
    backgroundColor: '#556D6A',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  infoCardContainer: {
    width: '48%',
    marginBottom: 30,
  },
  infoCard: {
    backgroundColor: '#F3F3F3',
    padding: 20,
    borderRadius: 10,
    height: 110,
    elevation: 5,
    justifyContent: 'flex-end',
    position: 'relative', // 부모 뷰에 상대적 위치 설정
    overflow: 'hidden', // 이미지가 카드 밖으로 나가지 않도록
  },
  cardImageBackground: {
    position: 'absolute', // 이미지 위치 설정
    top: 0, // 카드의 상단에 위치
    left: 0, // 카드의 왼쪽에 위치
    right: 0, // 카드의 오른쪽에 맞춤
    bottom: 0, // 카드의 하단에 맞춤
    borderRadius: 10, // 카드의 모서리 둥글게 만들기
    opacity: 0.45, // 이미지의 투명도 조절
    resizeMode: 'cover', // 이미지가 카드에 맞게 설정
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // 흐릿한 하얀색 배경
    paddingHorizontal: 5, // 텍스트 좌우 여백
    paddingVertical: 2, // 텍스트 위아래 여백
    borderRadius: 5, // 모서리 둥글게 처리
    position: 'absolute',
    bottom: 10, // 카드의 아래쪽에 위치
    left: 10, // 왼쪽에 여백 설정
    right: 10, // 오른쪽 여백 설정
    zIndex: 1, // 이미지 위로 표시
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    position: 'absolute',
    bottom: -20,
    right: 10,
  },
  infoDate: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
  },
  categoryBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#999',
  },
  historyContainer: {
    width: '100%',
    marginTop: 20, // History list spacing from the search bar
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  historyIconContainer: {
    marginRight: 10,
  },
  historyText: {
    fontSize: 16,
    flex: 1,
  },
  deleteText: {
    fontSize: 16,
    color: '#ff0000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginVertical: 5,
  },
  imageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  navigationText: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nearbySafetyContainer: {
    paddingHorizontal: '5%',
    marginVertical: 10,
  },
  nearbySafetyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  filteredPostsContainer: {
    marginVertical: 10,
  },
  nearbyPostContainer: {
    backgroundColor: 'transparent', // 배경색을 투명하게 설정
    borderRadius: 10,
    marginVertical: 5,
  },
  postCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#A51919',
    marginBottom: 5,
  },
  postMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  postTimestamp: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  noPostsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noPostsText: {
    fontSize: 14,
    color: '#999',
  },
  grayRectangle: {
    backgroundColor: '#e0e0e0',
    width: '90%',
    height: 320,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangleX: {
    color: 'black',
    fontSize: 250,
    fontWeight: '100',
  },
});

export default Community;
