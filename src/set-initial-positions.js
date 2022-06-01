const setInitialPositions = (rainCount) => {
    const initialPositions = [];
    const initialVelocities = [];
    const initialAccelerations = [];
    for (let i = 0; i < rainCount; i++) {
      initialPositions.push(-30 + Math.random() * 100);
      initialPositions.push(-50 + Math.random() * 200)
      initialPositions.push(-25 + Math.random() * 50);
      initialVelocities.push(0);
      initialVelocities.push(-8);
      initialVelocities.push(-4);
      initialAccelerations.push(5);
      initialAccelerations.push(3.8);
      initialAccelerations.push(0);
    }
    return [initialPositions, initialVelocities, initialAccelerations];
  };
  
  export default setInitialPositions;
  