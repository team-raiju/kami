let _showLog = $state(false);

export function showLog() {
  function toggle() {
    _showLog = !_showLog;
  }

  return {
    get showLog() {
      return _showLog;
    },
    toggle,
  };
}
