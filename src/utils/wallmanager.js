/**
 * @function startDrawing
 * @description 새로운 벽 그리기를 시작합니다. 클릭한 위치를 기준으로 초기 벽 데이터를 설정합니다.
 * @param {MouseEvent} event - 마우스 이벤트
 * @param {Array} walls - 기존 벽 데이터 배열
 * @param {Ref} previewWall - 미리보기 벽 데이터
 */
export const startDrawing = (event, walls, previewWall) => {
    let { offsetX, offsetY } = event;
  
    // 스냅 가능한 점 찾기 (벽 키 또는 벽 중심)
    const snapPoint = findSnapPoint(offsetX, offsetY, walls);
  
    if (snapPoint) {
      offsetX = snapPoint.x;
      offsetY = snapPoint.y;
    }
  
    // 미리보기 벽 초기화
    previewWall.value = {
      x1: offsetX,
      y1: offsetY,
      x2: offsetX,
      y2: offsetY,
      length: 0,
    };
  };
  
  /**
   * @function handleMouseMove
   * @description 마우스 이동 이벤트를 처리하여 벽 미리보기를 업데이트하거나 키를 드래그합니다.
   * @param {MouseEvent} event - 마우스 이벤트
   * @param {Array} walls - 기존 벽 데이터 배열
   * @param {Ref} previewWall - 미리보기 벽 데이터
   * @param {Ref} draggedKey - 드래그 중인 키 상태
   */
  export const handleMouseMove = (event, walls, previewWall, draggedKey) => {
    const { offsetX, offsetY } = event;
  
    if (draggedKey.value) {
      // 키 드래그 처리
      const { wall, keyType } = draggedKey.value;
      const snapPoint = findSnapPoint(offsetX, offsetY, walls);
      if (snapPoint) {
        if (keyType === "start") {
          wall.x1 = snapPoint.x;
          wall.y1 = snapPoint.y;
        } else {
          wall.x2 = snapPoint.x;
          wall.y2 = snapPoint.y;
        }
      } else {
        if (keyType === "start") {
          wall.x1 = offsetX;
          wall.y1 = offsetY;
        } else {
          wall.x2 = offsetX;
          wall.y2 = offsetY;
        }
      }
      wall.length = calculateLength(wall.x1, wall.y1, wall.x2, wall.y2);
    } else if (previewWall.value) {
      // 미리보기 벽 업데이트
      const snapPoint = findSnapPoint(offsetX, offsetY, walls);
      if (snapPoint) {
        const deltaX = Math.abs(snapPoint.x - previewWall.value.x1);
        const deltaY = Math.abs(snapPoint.y - previewWall.value.y1);
  
        if (deltaX > deltaY) {
          previewWall.value.x2 = snapPoint.x;
          previewWall.value.y2 = previewWall.value.y1; // 수평 유지
        } else {
          previewWall.value.x2 = previewWall.value.x1; // 수직 유지
          previewWall.value.y2 = snapPoint.y;
        }
      } else {
        const deltaX = Math.abs(offsetX - previewWall.value.x1);
        const deltaY = Math.abs(offsetY - previewWall.value.y1);
  
        if (deltaX > deltaY) {
          previewWall.value.x2 = offsetX;
          previewWall.value.y2 = previewWall.value.y1;
        } else {
          previewWall.value.x2 = previewWall.value.x1;
          previewWall.value.y2 = offsetY;
        }
      }
  
      previewWall.value.length = calculateLength(
        previewWall.value.x1,
        previewWall.value.y1,
        previewWall.value.x2,
        previewWall.value.y2
      );
    }
  };
  
  /**
   * @function handleMouseUp
   * @description 마우스 버튼을 뗄 때 벽 그리기를 완료하거나 키 드래그를 종료하며, 교차점 처리를 추가합니다.
   * @param {Array} walls - 기존 벽 데이터 배열
   * @param {Ref} previewWall - 미리보기 벽 데이터
   * @param {Ref} draggedKey - 드래그 중인 키 상태
   */
  export const handleMouseUp = (walls, previewWall, draggedKey) => {
    if (draggedKey.value) {
      draggedKey.value = null; // 키 드래그 종료
    } else if (previewWall.value) {
      // 교차점 처리와 벽 추가
      const updatedWalls = splitIntersectingWalls(walls, previewWall.value);
      walls.splice(0, walls.length, ...updatedWalls); // 벽 배열 갱신
      previewWall.value = null; // 미리보기 초기화
    }
  };
  
  
  /**
   * @function splitIntersectingWalls
   * @description 교차점을 계산하여 기존 벽을 분리하고 새로운 벽을 추가하며, 중복된 교차점 처리를 방지합니다.
   * @param {Array} walls - 기존 벽 데이터 배열
   * @param {Object} newWall - 새로 추가된 벽 데이터
   * @returns {Array} 업데이트된 벽 데이터 배열
   */
  const splitIntersectingWalls = (walls, newWall) => {
    let updatedWalls = [...walls];
    let wallsToProcess = [newWall]; // 처리 대기 중인 새 벽
    const processedIntersections = new Set(); // 이미 처리된 교차점 기록
  
    while (wallsToProcess.length > 0) {
      const currentWall = wallsToProcess.pop(); // 처리할 벽
      let isSplit = false;
  
      for (let i = 0; i < updatedWalls.length; i++) {
        const wall = updatedWalls[i];
        const intersection = calculateIntersection(
          wall.x1, wall.y1, wall.x2, wall.y2,
          currentWall.x1, currentWall.y1, currentWall.x2, currentWall.y2
        );
  
        if (intersection) {
          const intersectionKey = `${intersection.x}-${intersection.y}`;
          if (processedIntersections.has(intersectionKey)) {
            continue; // 이미 처리된 교차점이면 무시
          }
          processedIntersections.add(intersectionKey); // 처리된 교차점 추가
  
          // 기존 벽 분리
          const [newWall1, newWall2] = splitWall(wall, intersection);
          updatedWalls.splice(i, 1, newWall1, newWall2); // 기존 벽 대체
          i--; // 배열 크기 조정
  
          // 새롭게 추가된 벽 분리
          const [newWall3, newWall4] = splitWall(currentWall, intersection);
          wallsToProcess.push(newWall3, newWall4); // 분리된 새 벽 대기열 추가
          isSplit = true;
          break; // 분리 완료 후 반복 종료
        }
      }
  
      if (!isSplit) {
        updatedWalls.push(currentWall); // 더 이상 교차점이 없으면 벽 추가
      }
    }
  
    return updatedWalls;
  };
  
  
  
  
  /**
   * @function calculateIntersection
   * @description 두 벽의 교차점을 계산합니다.
   * @param {number} x1, y1, x2, y2 - 첫 번째 벽 좌표
   * @param {number} x3, y3, x4, y4 - 두 번째 벽 좌표
   * @returns {Object|null} 교차점 좌표 { x, y } 또는 null
   */
  const calculateIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
    const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denominator === 0) return null; // 평행한 경우
  
    const px =
      ((x1 * y2 - y1 * x2) * (x3 - x4) -
        (x1 - x2) * (x3 * y4 - y3 * x4)) /
      denominator;
    const py =
      ((x1 * y2 - y1 * x2) * (y3 - y4) -
        (y1 - y2) * (x3 * y4 - y3 * x4)) /
      denominator;
  
    // 교차점이 선분 범위 내에 있는지 확인
    if (
      px >= Math.min(x1, x2) &&
      px <= Math.max(x1, x2) &&
      py >= Math.min(y1, y2) &&
      py <= Math.max(y1, y2) &&
      px >= Math.min(x3, x4) &&
      px <= Math.max(x3, x4) &&
      py >= Math.min(y3, y4) &&
      py <= Math.max(y3, y4)
    ) {
      return { x: px, y: py };
    }
    return null;
  };
  
  /**
   * @function splitWall
   * @description 교차점을 기준으로 벽을 분리합니다.
   * @param {Object} wall - 기존 벽 데이터
   * @param {Object} intersectionPoint - 교차점 좌표
   * @returns {Array} 분리된 벽 배열
   */
  const splitWall = (wall, intersectionPoint) => {
    const newWall1 = {
      x1: wall.x1,
      y1: wall.y1,
      x2: intersectionPoint.x,
      y2: intersectionPoint.y,
      length: calculateLength(wall.x1, wall.y1, intersectionPoint.x, intersectionPoint.y),
    };
  
    const newWall2 = {
      x1: intersectionPoint.x,
      y1: intersectionPoint.y,
      x2: wall.x2,
      y2: wall.y2,
      length: calculateLength(intersectionPoint.x, intersectionPoint.y, wall.x2, wall.y2),
    };
  
    return [newWall1, newWall2];
  };
  
  
  
  /**
   * @function onKeyDragStart
   * @description 키 드래그를 시작합니다.
   * @param {Object} wall - 드래그할 벽 데이터
   * @param {string} keyType - 드래그할 키 유형 ("start" 또는 "end")
   * @param {Ref} draggedKey - 드래그 중인 키 상태
   */
  export const onKeyDragStart = (wall, keyType, draggedKey) => {
    draggedKey.value = { wall, keyType };
  };
  
  // 스냅 거리 설정 (30px)
  const SNAP_DISTANCE = 30;
  
  /**
   * @function findSnapPoint
   * @description 주어진 좌표에서 가장 가까운 스냅 가능한 점을 찾습니다.
   * @param {number} x - 현재 x 좌표
   * @param {number} y - 현재 y 좌표
   * @param {Array} walls - 기존 벽 데이터 배열
   * @returns {Object|null} 스냅된 좌표 { x, y } 또는 null
   */
  const findSnapPoint = (x, y, walls) => {
    let closestPoint = null;
    let minDistance = SNAP_DISTANCE;
  
    for (const wall of walls) {
      // 1. 키 <-> 키 스냅
      const points = [
        { x: wall.x1, y: wall.y1 },
        { x: wall.x2, y: wall.y2 },
      ];
  
      for (const point of points) {
        const distance = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
        if (distance < minDistance) {
          closestPoint = point;
          minDistance = distance;
        }
      }
  
      // 2. 키 <-> 벽 선 위 스냅
      const wallVector = { x: wall.x2 - wall.x1, y: wall.y2 - wall.y1 };
      const wallLength = Math.sqrt(wallVector.x ** 2 + wallVector.y ** 2);
      const normalizedVector = {
        x: wallVector.x / wallLength,
        y: wallVector.y / wallLength,
      };
  
      const pointVector = { x: x - wall.x1, y: y - wall.y1 };
      const projectionLength =
        pointVector.x * normalizedVector.x + pointVector.y * normalizedVector.y;
  
      if (projectionLength >= 0 && projectionLength <= wallLength) {
        const projectionPoint = {
          x: wall.x1 + normalizedVector.x * projectionLength,
          y: wall.y1 + normalizedVector.y * projectionLength,
        };
  
        const distanceToWall = Math.sqrt(
          (projectionPoint.x - x) ** 2 + (projectionPoint.y - y) ** 2
        );
  
        if (distanceToWall < minDistance) {
          closestPoint = projectionPoint;
          minDistance = distanceToWall;
        }
      }
    }
  
    return closestPoint;
  };
  
  /**
   * @function calculateLength
   * @description 두 점 사이의 거리를 계산합니다.
   * @param {number} x1 - 시작 x 좌표
   * @param {number} y1 - 시작 y 좌표
   * @param {number} x2 - 끝 x 좌표
   * @param {number} y2 - 끝 y 좌표
   * @returns {number} 두 점 사이의 거리
   */
  const calculateLength = (x1, y1, x2, y2) => {
    // 숫자형인지 확인
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
      console.error("Invalid coordinates for length calculation:", { x1, y1, x2, y2 });
      return 0;
    }
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2).toFixed(0);
  };
  