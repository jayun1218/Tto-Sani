# iOS 하이브리드 앱 전환 가이드 (Capacitor + HealthKit)

이 가이드는 현재의 Next.js 웹 프로젝트를 iOS 환경에서 구동하고 HealthKit(걸음수) 데이터를 연동하기 위한 절차를 설명합니다.

## 1. Capacitor 프로젝트 설정
프론트엔드 루트(`frontend/`)에서 다음 명령어를 순서대로 실행하세요.

```bash
cd frontend
# 1. Capacitor 핵심 모듈 설치
npm install @capacitor/core @capacitor/cli

# 2. Capacitor 초기화
npx cap init "TtoSani" "com.jayun.ttosani" --webDir out

# 3. iOS 플랫폼 추가
npm install @capacitor/ios
npx cap add ios
```

## 2. HealthKit 플러그인 설치
걸음수 데이터를 가져오기 위한 전용 플러그인을 설치합니다.

```bash
cd frontend
npm install @perfood/capacitor-healthkit
npx cap sync
```

## 3. iOS 권한 설정 (Info.plist)
iOS 앱에서 건강 데이터에 접근하려면 권한 설명이 필수입니다. `frontend/ios/App/App/Info.plist` 파일을 열어 다음 내용을 추가하세요.

```xml
<key>NSHealthShareUsageDescription</key>
<string>소비 패턴 분석 및 보상 지급을 위해 걸음수 데이터를 수집합니다.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>걸음수 데이터를 기록하고 관리합니다.</string>
```

## 4. 프론트엔드 코드 연동 예시
이제 React 코드 내에서 다음과 같이 걸음수를 가져와 서버로 보낼 수 있습니다.

```javascript
import { CapacitorHealthkit } from '@perfood/capacitor-healthkit';

const syncSteps = async () => {
  try {
    // 1. 권한 요청
    await CapacitorHealthkit.requestAuthorization({
      all: ['steps'],
      read: ['steps'],
      write: []
    });

    // 2. 오늘의 걸음수 조회
    const result = await CapacitorHealthkit.queryHKitSampleType({
        sampleName: 'steps',
        startDate: new Date().setHours(0,0,0,0),
        endDate: new Date()
    });

    const totalSteps = result.values.reduce((sum, val) => sum + val.value, 0);

    // 3. 서버와 동기화
    await axios.post('/gamification/steps/sync', { steps: totalSteps });
  } catch (error) {
    console.error("HealthKit 연동 실패:", error);
  }
};
```

## 5. 빌드 및 실행
```bash
cd frontend
# Next.js 정적 빌드
npm run build 

# Capacitor 동기화 및 Xcode 실행
npx cap sync
npx cap open ios
```

Xcode가 열리면 시뮬레이션 버튼을 눌러 아이폰에서 바로 확인하실 수 있습니다! 😊🚀
