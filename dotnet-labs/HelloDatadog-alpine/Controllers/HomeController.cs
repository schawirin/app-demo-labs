using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace HelloDatadog.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [Route("generate-trace")]
        public IActionResult GenerateTrace()
        {
            return Json(new { message = "Trace generated without logging!" });
        }

        [HttpPost]
        [Route("generate-trace-with-log")]
        public IActionResult GenerateTraceWithLog()
        {
            _logger.LogInformation("Generated trace with logging");
            return Json(new { message = "Trace generated with logging!" });
        }
    }
}
